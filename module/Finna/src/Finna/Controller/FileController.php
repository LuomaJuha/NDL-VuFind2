<?php

/**
 * Generates record images.
 *
 * PHP version 8
 *
 * Copyright (C) Villanova University 2011.
 * Copyright (C) The National Library of Finland 2015-2020.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.    See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA    02111-1307    USA
 *
 * @category VuFind
 * @package  Controller
 * @author   Samuli Sillanpää <samuli.sillanpaa@helsinki.fi>
 * @author   Ere Maijala <ere.maijala@helsinki.fi>
 * @author   Kalle Pyykkönen <kalle.pyykkonen@helsinki.fi>
 * @author   Juha Luoma <juha.luoma@helsinki.fi>
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://vufind.org Main Page
 */

namespace Finna\Controller;

use Finna\File\Loader as FileLoader;
use VuFind\Controller\AbstractBase;
use VuFind\Session\Settings as SessionSettings;

use function in_array;

/**
 * Controller for handling file downloads
 */
class FileController extends AbstractBase
{
    /**
     * Constructor
     *
     */
    public function __construct(
        protected FileLoader $fileLoader,
        protected SessionSettings $sessionSettings,
        protected \Laminas\Config\Config $datasourceConfig,
        protected \Laminas\Config\Config $mainConfig,
        protected \VuFind\Record\Loader $recordLoader
    ) {
    }

    /**
     * Get a file from provider and send it to user. Use 2 different functions to
     * allow setting different values for rateLimiter. This type of action uses lot of resources,
     * so setting strict limits is important.
     *
     * @return \Laminas\Http\Response
     */
    public function loadAction()
    {
      $this->sessionSettings->disableWrite(); // avoid session write timing bug
      return $this->processLoad();
    }

    /**
     * Get a file from provider and send it to user. Use 2 different functions to
     * allow setting different values for rateLimiter. This type of action uses lot of resources,
     * so setting strict limits is important.
     *
     * @return \Laminas\Http\Response
     */
    public function loadRelaxedAction()
    {
      $params = $this->params();
      $setPass = $this->mainConfig->Content->load_relaxed_auth ?? false;
      if (!$setPass) {
        $response = $this->getResponse();
        $response->setStatusCode(404);
        return $response;
      }
      $auth = $params->fromHeader('Authorization');
      if (!$auth || $auth->getFieldValue() !== $setPass) {
        $response = $this->getResponse();
        $response->setStatusCode(401);
        return $response;
      }
      return $this->processLoad();
    }
  
    protected function processLoad()
    {
      $params = $this->params();
      $response = $this->getResponse();
      // check if the requested file is allowed to be proxied
      $params = $this->params();
      $type = $params->fromQuery('type');
      $recordId = $params->fromQuery('id');
      $source = $params->fromQuery('source', DEFAULT_SEARCH_BACKEND);
      if (!$recordId) {
        $response->setStatusCode(400);
        return $response;
      }
      // Get the record to download file from
      $record = $this->recordLoader->load($recordId, $source);
      // Format of the file to download
      switch ($type) {
        case 'highresimg':
          return $this->processLoadImage();
        case 'document':
          return $this->processLoadDocument();
        default:
          $response->setStatusCode(400);
          break;
      }
      return $response;
    }

    /**
     * Function to process image loading
     *
     * @return \Laminas\Http\Response
     */
    public function processLoadImage()
    {
      $this->sessionSettings->disableWrite(); // avoid session write timing bug

      $params = $this->params();
      $response = $this->getResponse();
      // check if the requested file is allowed to be proxied
      $params = $this->params();
      $recordId = $params->fromQuery('id');
      $source = $params->fromQuery('source', DEFAULT_SEARCH_BACKEND);
      if (!$recordId) {
        $response->setStatusCode(400);
        return $response;
      }
      // Get the record to download file from
      $record = $this->recordLoader->load($recordId, $source);
      // Format of the file to download
      $format = $params->fromQuery('format');
      // Index of the requested image in getAllImages result
      $index = $params->fromQuery('index');
      // Size which is master or original
      $size = $params->fromQuery('size');
      // Key is the index of the size, multiple different high-res images is possible.
      $key = $params->fromQuery('key', -1);

      $images = $record->tryMethod('getAllImages');
      $image = $images[$index]['highResolution'][$size][$key] ?? [];
      if (!$image) {
        $response->setStatusCode(404);
        return $response;
      }
      $fileUrl = $image['url'];
      $formedFilename = "$recordId-$index-$size.$format";

      if ($fileUrl) {
        $result = $this->fileLoader->proxyFileLoad($fileUrl, $formedFilename, $format);
        if (!$result) {
          $response->setStatusCode(500);
        }
      }
      return $response;
    }

    /**
     * Function to process document loading
     *
     * @return \Laminas\Http\Response
     */
    public function processLoadDocument()
    {
      $this->sessionSettings->disableWrite(); // avoid session write timing bug

      $params = $this->params();
      $response = $this->getResponse();
      // check if the requested file is allowed to be proxied
      $params = $this->params();
      $recordId = $params->fromQuery('id');
      $source = $params->fromQuery('source', DEFAULT_SEARCH_BACKEND);
      // Get the record to download file from
      $record = $this->recordLoader->load($recordId, $source);
      // Format of the file to download
      $format = $params->fromQuery('format');
      // Index of the requested image in getAllImages result
      $index = $params->fromQuery('index');
      $documents = $record->tryMethod('getDocuments');
      $document = $documents[$index] ?? [];
      if (!$document) {
        $response->setStatusCode(404);
        return $response;
      }
      $fileUrl = $document['url'];
      $formedFilename = "$recordId-$index.$format";

      if ($fileUrl) {
        $result = $this->fileLoader->proxyFileLoad($fileUrl, $formedFilename, $format);
        if (!$result) {
          $response->setStatusCode(500);
        }
      }
      return $response;
    }
}
  
