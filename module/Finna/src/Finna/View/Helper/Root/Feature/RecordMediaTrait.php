<?php

namespace Finna\View\Helper\Root\Feature;

trait RecordMediaTrait
{
  public function getMediaURLs($openUrlActive = false): array
  {
    $cacheKey = __FUNCTION__ . "|" . $openUrlActive ? 'true' : 'false';
    if (isset($this->cache[$cacheKey])) {
      return $this->cache[$cacheKey];
    }
    $onlineURLs = $this->driver->tryMethod('getOnlineURLs', [], []);
    $videos = $this->getVideos($onlineURLs);
    $audios = $this->getAudios($onlineURLs);

    $mergedDataURLs = $this->driver->tryMethod('getMergedRecordData')['urls'] ?? [];
    $videos = [...$videos, ...$this->getVideos($mergedDataURLs)];
    $audios = [...$audios, ...$this->getAudios($mergedDataURLs)];

    $urls = $this->getLinkDetails($openUrlActive);
    $videos = [...$videos, ...$this->getVideos($urls)];
    $audios = [...$audios, ...$this->getAudios($urls)];
    $models = $this->driver->tryMethod('getModels', [], []);

    // Try to filter out duplicate urls here from onlineURLs, mergedDataURLs and urls.
    $filteredURLs = [];
    foreach ($onlineURLs as $url) {
      foreach ($mergedDataURLs as $mergedURL) {
        if ($url['url'] === $mergedURL['url']) {
          continue 2;
        }
      }
      $filteredURLs[] = $url;
    }
    $audios = $this->getAudios($filteredURLs);
    $videos = $this->getVideos($filteredURLs);
    $models = $this->driver->tryMethod('getModels', [], []);

    $medias = compact('audios', 'videos', 'models');
    return $this->cache[$cacheKey] = [
      'medias' => $medias,
      'hasDigitalObjects' => $audios || $videos || $models,
      'nonMediaURLs' => $filteredURLs,
    ]; 
  }
  public function getAudios(&$urls): array
  {
    $results = [];
    foreach ($urls as $i => $url) {
      if ($url['embed'] ?? false === 'audio') {
        $results[$i] = $url;
      }
    }
    $urls = array_diff_key($urls, $results);
    return $results;
  }
  public function getVideos(&$urls): array
  {
    $results = [];
    $recordLinker = $this->getView()->plugin('recordLinker');
    foreach ($urls as $i => $url) {
      if (
        ($url['embed'] ?? false) === 'video'
        || $recordLinker()->getEmbeddedVideo($url['url']) == 'data-embed-iframe'
      ) {
        $results[$i] = $url;
      }
    }
    $urls = array_diff_key($urls, $results);
    return $results;
  }
}
