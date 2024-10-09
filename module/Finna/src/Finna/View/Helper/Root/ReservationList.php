<?php

/**
 * Reservation list view helper
 *
 * PHP version 8
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
 * @package  View_Helpers
 * @author   Juha Luoma <juha.luoma@helsinki.fi>
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     http://vufind.org   Main Site
 */

namespace Finna\View\Helper\Root;

use Finna\Db\Entity\FinnaResourceListEntityInterface;
use Finna\ReservationList\ReservationListService;
use VuFind\Auth\ILSAuthenticator;
use VuFind\Db\Entity\UserEntityInterface;
use VuFind\RecordDriver\DefaultRecord;

use function in_array;

/**
 * Reservation list view helper
 *
 * @category VuFind
 * @package  View_Helpers
 * @author   Juha Luoma <juha.luoma@helsinki.fi>
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     http://vufind.org   Main Site
 */
class ReservationList extends \Laminas\View\Helper\AbstractHelper
{
    /**
     * User logged in or null
     *
     * @var UserEntityInterface|null
     */
    protected ?UserEntityInterface $user;

    /**
     * Constructor
     *
     * @param ReservationListService $reservationListService Reservation list service
     * @param ILSAuthenticator       $ilsAuthenticator       Authenticator to ILS
     * @param array                  $config                 Reservation list yaml as an array
     */
    public function __construct(
        protected ReservationListService $reservationListService,
        protected ILSAuthenticator $ilsAuthenticator,
        protected array $config = []
    ) {
    }

    /**
     * Invoke
     *
     * @param ?UserEntityInterface $user User currently logged in or null
     *
     * @return self
     */
    public function __invoke(?UserEntityInterface $user = null): self
    {
        $this->user = $user;
        return $this;
    }

    /**
     * Get associative array of [institution => configured lists] where driver matches
     *
     * @param DefaultRecord $driver Record driver
     *
     * @return array
     */
    protected function getAvailableListsForRecord(DefaultRecord $driver): array
    {
        $datasource = $driver->tryMethod('getDatasource', [], '');
        if (!$datasource) {
            return [];
        }
        $result = [];
        foreach ($this->config as $institution => $settings) {
            $current = [$institution => []];
            if ($lists = $settings['Lists'] ?? []) {
                foreach ($lists as $list) {
                    if (in_array($datasource, $list['Datasources'] ?? []) && $this->checkUserRightsForList($list)) {
                        $current[$institution][] = $list;
                        continue;
                    }
                }
            }
            if ($current[$institution]) {
                $result = array_merge($result, $current);
            }
        }
        return $result;
    }

    /**
     * Get list properties defined by institution and list identifier in ReservationList.yaml,
     * institution specified information and
     * formed translation_keys for the list.
     *
     * Institution information contains keys and values:
     *     - name => Example institution name
     *     - address => Example institution address
     *     - postal => Example institution postal
     *     - city => Example institution city
     *     - email => Example institution email
     *
     * Translation keys formed:
     *     - title => list_title_{$institution}_{$listIdentifier},
     *     - description => list_description_{$institution}_{$listIdentifier},
     *
     * @param string $institution    Lists controlling institution
     * @param string $listIdentifier List identifier
     *
     * @return array
     */
    public function getListProperties(
        string $institution,
        string $listIdentifier
    ): array {
        foreach ($this->config[$institution]['Lists'] ?? [] as $list) {
            if (($list['Identifier'] ?? false) === $listIdentifier) {
                return [
                    'properties' => $list,
                    'institution_information' => $this->config[$institution]['Information'] ?? [],
                    'translation_keys' => [
                        'title' => "list_title_{$institution}_{$listIdentifier}",
                        'description' => "list_description_{$institution}_{$listIdentifier}",
                    ],
                ];
            }
        }
        return [
            'properties' => [],
            'institution_information' => [],
            'translation_keys' => [],
        ];
    }

    /**
     * Check if the user has proper requirements to order records.
     * Function checks if there is required LibraryCardSources
     * which are used to check if user has an active connection to ils
     * defined in the list.
     *
     * @param array $list List as configuration
     *
     * @return bool
     */
    public function checkUserRightsForList(array $list): bool
    {
        $sources = $list['LibraryCardSources'] ?? false;
        if (!$sources) {
            return true;
        }
        $patron = $this->ilsAuthenticator->storedCatalogLogin();
        if (!$patron) {
            return false;
        }
        return in_array($patron['source'], $sources);
    }

    /**
     * Display buttons which routes the request to proper list procedures
     * Checks if the list should be displayed for logged-in only users.
     *
     * @param DefaultRecord $driver Driver to use for checking available lists
     *
     * @return string
     */
    public function renderReserveTemplate(DefaultRecord $driver): string
    {
        // Collect lists where we could potentially save this:
        $lists = $this->getAvailableListsForRecord($driver);

        // Set up the needed context in the view:
        $view = $this->getView();
        return $view->render('Helpers/reservationlist-reserve.phtml', compact('lists', 'driver'));
    }

    /**
     * Get available reservation lists for user, user must be invoked
     *
     * @return FinnaResourceListEntityInterface[]
     */
    public function getReservationListsForUser(): array
    {
        return $this->reservationListService->getReservationListsForUser($this->user);
    }

    /**
     * Get lists containing record
     *
     * @param DefaultRecord $record Record
     *
     * @return FinnaResourceListEntityInterface[]
     */
    public function getListsContainingRecord(DefaultRecord $record): array
    {
        if (!$this->user) {
            return [];
        }
        return $this->reservationListService->getListsContainingRecord($this->user, $record);
    }
}
