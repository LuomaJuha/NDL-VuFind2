<?php

/**
 * Row Definition for finna_reservation_list
 *
 * PHP version 8.1
 *
 * Copyright (C) The National Library of Finland 2024.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * @category VuFind
 * @package  Db_Row
 * @author   Ere Maijala <ere.maijala@helsinki.fi>
 * @author   Juha Luoma <juha.luoma@helsinki.fi>
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     http://vufind.org   Main Site
 */

namespace Finna\Db\Row;

use Finna\Db\Entity\ReservationListEntityInterface;
use Laminas\Session\Container;
use VuFind\Db\Row\RowGateway;
use VuFind\Exception\ListPermission as ListPermissionException;
use VuFind\Exception\MissingField as MissingFieldException;

/**
 * Row Definition for finna_reservation_list
 *
 * @category VuFind
 * @package  Db_Row
 * @author   Ere Maijala <ere.maijala@helsinki.fi>
 * @author   Juha Luoma <juha.luoma@helsinki.fi>
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     http://vufind.org   Main Site
 *
 * @property int    $id
 * @property int    $user_id
 * @property string $title
 * @property string $datasource
 * @property string $description
 * @property string $building
 * @property string $created
 * @property bool   $public
 * @property string $ordered
 * @property string $pickup_date
 * @property string $handler
 */
class ReservationList extends RowGateway implements ReservationListEntityInterface
{
    use \VuFind\Db\Table\DbTableAwareTrait;

    /**
     * Constructor
     *
     * @param \Laminas\Db\Adapter\Adapter $adapter Database adapter
     * @param ?Container                  $session Session container
     */
    public function __construct($adapter, protected ?Container $session = null)
    {
        // Parents parent
        parent::__construct('id', 'finna_reservation_list', $adapter);
    }

    public function getId(): int
    {
        return $this->id;
    }

    /**
     * Sets the ordered data for the reservation list.
     *
     * @param User   $user        User or false.
     * @param string $pickup_date Set pickup date
     *
     * @return mixed
     */
    public function setOrdered($user, $pickup_date)
    {
        $this->ordered = date('Y-m-d H:i:s');
        $this->pickup_date = $pickup_date;
        return $this->save($user);
    }

    /**
     * Update and save the list object using a request object -- useful for
     * sharing form processing between multiple actions.
     *
     * @param UserEntityInterface|bool   $user    Logged-in user (false if none)
     * @param \Laminas\Stdlib\Parameters $request Request to process
     *
     * @return int ID of newly created row
     * @throws ListPermissionException
     * @throws MissingFieldException
     */
    public function updateFromRequest($user, $request): int
    {
        $this->title = $request->get('title');
        $this->description = $request->get('description');
        $this->datasource = $request->get('datasource');
        $this->building = $request->get('building');
        $this->handler = $request->get('handler');
        $this->save($user);
        return $this->id;
    }

    /**
     * Is the current user allowed to edit this list?
     *
     * @param UserEntityInterface $user Logged-in user
     *
     * @return bool
     */
    public function editAllowed($user): bool
    {
        return $user && $user->id == $this->user_id;
    }

    /**
     * Destroy the list.
     *
     * @param UserEntityInterface|bool $user  Logged-in user (false if none)
     * @param bool                     $force Should we force the delete without
     * checking permissions?
     *
     * @return int The number of rows deleted.
     */
    public function delete($user = false, $force = false): int
    {
        if (!$force && !$this->editAllowed($user)) {
            throw new ListPermissionException('list_access_denied');
        }

        // Remove user_resource and resource_tags rows:
        $reservationListResource = $this->getDbTable(\Finna\Db\Table\ReservationListResource::class);
        $reservationListResource->destroyLinks(null, $this->user_id, $this->id);

        // Remove the list itself:
        return parent::delete();
    }

    /**
     * Saves the properties to the database.
     *
     * This performs an intelligent insert/update, and reloads the
     * properties with fresh data from the table on success.
     *
     * @param UserEntityInterface|bool $user Logged-in user (false if none)
     *
     * @return mixed The primary key value(s), as an associative array if the
     *     key is compound, or a scalar if the key is single-column.
     * @throws ListPermissionException
     * @throws MissingFieldException
     */
    public function save($user = false): array|int
    {
        if (!$this->editAllowed($user ?: null)) {
            throw new ListPermissionException('list_access_denied');
        }
        if (empty($this->title)) {
            throw new MissingFieldException('list_edit_name_required');
        }

        parent::save();
        $this->rememberLastUsed();
        return $this->id;
    }

    /**
     * Remember that this list was used so that it can become the default in
     * dialog boxes.
     *
     * @return void
     */
    public function rememberLastUsed(): void
    {
        if (null !== $this->session) {
            $this->session->lastUsed = $this->id;
        }
    }

    /**
     * Given an array of item ids, remove them from this list
     *
     * @param UserEntityInterface $user   Logged-in user (false if none)
     * @param array               $ids    IDs to remove from the list
     * @param string              $source Type of resource identified by IDs
     *
     * @return void
     */
    public function removeResourcesById($user, $ids, $source = DEFAULT_SEARCH_BACKEND): void
    {
        if (!$this->editAllowed($user)) {
            throw new ListPermissionException('list_access_denied');
        }

        /**
         * Resource table
         *
         * @var \VuFind\Db\Table\Resource
         */
        $resourceTable = $this->getDbTable('Resource');
        $resources = $resourceTable->getResourcesByRecordIds($ids, $source);

        $resourceIDs = [];
        foreach ($resources as $current) {
            $resourceIDs[] = $current?->id ?? $current['id'];
        }

        /**
         * Reservation list to resource relation
         *
         * @var \Finna\Db\Table\ReservationListResource
         */
        $listResourceTable = $this->getDbTable(\Finna\Db\Table\ReservationListResource::class);
        $listResourceTable->destroyLinks(
            $resourceIDs,
            $this->user_id,
            $this->id
        );
    }
}
