<?php

// TRANSLATION CLASS
require_once('translation.php');
use Translation\Translation;

Translation::setLocalesDir(__DIR__ . '/../locales');

$_moduleName = Translation::of('assets');
$_moduleLink = 'index.php?site=assets';

$assetSQL = $db->query("SELECT *, (SELECT COUNT(assetID) FROM asset_player WHERE asset_player.assetID = assets.assetID) playerCount FROM assets ORDER BY created DESC");
$playerList = '';
$playerSQL = $db->query("SELECT * FROM `player` ORDER BY name");
while ($player = $playerSQL->fetchArray(SQLITE3_ASSOC)) {
  if (hasPlayerRight($loginUserID, $player["playerID"])) {
    $playerList .= '
          <label class="form-selectgroup-item flex-fill">
            <input type="checkbox" name="id[]" data-id="' . $player['playerID'] . '" data-ip="' . $player['address'] . '" data-endpoint="' . checkHTTP($player['address']) . $player['address'] . '/api/v1/file_asset" value="' . $player["playerID"] . '" class="form-selectgroup-input">
            <div class="form-selectgroup-label d-flex align-items-center p-3">
              <div class="mr-3">
                <span class="form-selectgroup-check"></span>
              </div>
              <div class="form-selectgroup-label-content d-flex align-items-center">
                <div class="lh-sm">
                  <div class="strong">' . $player['name'] . '</div>
                  <div class="text-muted">IP: ' . $player['address'] . '</div>
                </div>
              </div>
            </div>
          </label>
      ';
  }
}

echo '
  <div class="container-xl">
    <div class="page-header">
      <div class="row align-items-center">
        <div class="col-auto">
          <h2 class="page-title">
            Assets Management
          </h2>
        </div>
        <div class="col-auto ml-auto">
            <a href="#" data-toggle="modal" data-target="#addAssetMulti" class="btn btn-info">
              Add Asset
            </a>
        </div>
      </div>
    </div>
    <div class="row">
          <div class="col-md-12">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Asset List</h3>
              </div>
              <div class="card-body border-bottom py-3">
                <div class="d-flex">
                  <div class="text-muted">
                    ' . Translation::of('show') . '
                    <div class="mx-2 d-inline-block">
                      <select class="form-select form-select-sm" id="assetsLength_change">
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="-1">All</option>
                      </select>
                    </div>
                    ' . strtolower(Translation::of('entries')) . '
                  </div>
                  <div class="ml-auto text-muted">
                    ' . Translation::of('search') . ':
                    <div class="ml-2 d-inline-block">
                      <input type="text" class="form-control form-control-sm" id="assetsSearch">
                    </div>
                  </div>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table vertical-center" id="assets_table">
                  <thead class="text-primary">
                    <tr>
                      <th>Image</th>
                      <th>Asset Name</th>
                      <th>Asset Type</th>
                      <th>Players Count</th>
                      <th>Created</th>
                      <th>Last Updated</th>
                      <th><span class="d-none d-sm-block">' . Translation::of('options') . '</span></th>
                    </tr>
                  </thead>
                  <tbody>';
while ($asset = $assetSQL->fetchArray(SQLITE3_ASSOC)) {
  $title = $asset['title'];
  $type = $asset['type'];
  $url = $asset['url'];
  $created = $asset['created'];
  $lastUpdated = $asset['lastUpdated'];
  $playerCount = $asset['playerCount'];

  $assetImg = '<img class="img-fluid" src="' . $url . '" width="80" />';
  $deleteBtn = '
    <a href="#" class="text-danger ml-3" data-toggle="modal" data-target="#confirmMessage" data-status="danger" data-text="' . Translation::of('msg.delete_really_entry') . '" data-href="' . $_moduleLink . '&action=delete-asset&assetID=' . $asset['assetID'] . '" title="Delete Asset">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"></path><line x1="4" y1="7" x2="20" y2="7"></line><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path></svg>
    </a>';
  echo '
                  <tr>
                    <td>' . $assetImg . '</td>
                    <td>' . $title . '</td>
                    <td>' . $type . '</td>
                    <td class="text-center">' . $playerCount . '</td>
                    <td>' . $created . '</td>
                    <td>' . $lastUpdated . '</td>
                    <td>' . $deleteBtn . '</td>
                  </tr>';
}
echo '
                  </tbody>
                </table>
              </div>
              <div class="card-footer d-flex align-items-center">
                <p class="m-0 text-muted" id="dataTables_info"></p>
                <span class="pagination m-0 ml-auto" id="dataTables_paginate"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
';

if (hasAssetAddRight($loginUserID)) {
  echo '
  <div class="modal modal-blur fade close_modal" id="addAssetMulti" tabindex="-1" role="dialog" aria-labelledby="newAssetMultiModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content shadow">
        <div class="modal-header">
          <h5 class="modal-title" id="newAssetMultiModalLabel">' . Translation::of('multi_uploader') . '</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="' . Translation::of('close') . '">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <label class="form-label">' . Translation::of('upload_mode') . '</label>
          <div class="form-selectgroup-boxes row mb-3">
            <div class="col-lg-6">
              <label class="form-selectgroup-item">
                <input type="radio" name="add_asset_mode" class="form-selectgroup-input" value="view_url" checked>
                <span class="form-selectgroup-label d-flex align-items-center p-3">
                  <span class="mr-3">
                    <span class="form-selectgroup-check"></span>
                  </span>
                  <span class="form-selectgroup-label-content">
                    <span class="form-selectgroup-title strong mb-1">' . Translation::of('url') . '</span>
                  </span>
                </span>
              </label>
            </div>
            <div class="col-lg-6">
              <label class="form-selectgroup-item">
                <input type="radio" name="add_asset_mode" class="form-selectgroup-input" value="view_upload">
                <span class="form-selectgroup-label d-flex align-items-center p-3">
                  <span class="mr-3">
                    <span class="form-selectgroup-check"></span>
                  </span>
                  <span class="form-selectgroup-label-content">
                    <span class="form-selectgroup-title strong mb-1">' . Translation::of('upload') . '</span>
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
        <div class="view_url tab">
          <form id="assetNewForm" action="' . $_SERVER['REQUEST_URI'] . '" method="POST" data-multiloader="true">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">' . Translation::of('asset_url') . '</label>
                <input name="url" type="text" pattern="^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&\'\(\)\*\+,;=.]+$" class="form-control" id="InputNewAssetUrl" placeholder="http://www.example.com" autofocus>
              </div>
              <div class="mb-3">
                <div class="form-label">' . Translation::of('asset_settings') . '</div>
                <label class="form-check form-switch">
                  <input class="form-check-input toggle_div" data-src=".defaults_url" type="checkbox">
                  <span class="form-check-label">' . Translation::of('change_defaults') . '</span>
                </label>
              </div>
              <div class="defaults_url" style="display: none">
                <div class="row">
                  <div class="col-lg-8">
                    <div class="mb-3">
                      <label class="form-label">' . Translation::of('start') . '</label>
                      <div class="input-icon caltime-padding">
                        <input name="start_date" type="text" value="' . date('Y-m-d', strtotime('now')) . '" class="form-control asset_start" placeholder="' . Translation::of('start_date') . '" />
                        <span class="input-icon-addon"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"/><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="4" y1="11" x2="20" y2="11" /><line x1="11" y1="15" x2="12" y2="15" /><line x1="12" y1="15" x2="12" y2="18" /></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">&nbsp;</label>
                      <div class="input-icon caltime-padding">
                        <input name="start_time" type="text" class="form-control asset_start_time" placeholder="' . Translation::of('start_time') . '" value="00:00" />
                        <span class="input-icon-addon"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-md" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"></path><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 9 15"></polyline></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-8">
                    <div class="mb-3">
                      <label class="form-label">' . Translation::of('end') . '</label>
                      <div class="input-icon caltime-padding">
                        <input name="end_date" type="date" class="form-control asset_end" placeholder="' . Translation::of('end_date') . '" value="' . date('Y-m-d', strtotime('+' . $set['end_date'] . ' week')) . '" />
                        <span class="input-icon-addon"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"/><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="4" y1="11" x2="20" y2="11" /><line x1="11" y1="15" x2="12" y2="15" /><line x1="12" y1="15" x2="12" y2="18" /></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">&nbsp;</label>
                      <div class="input-icon caltime-padding">
                        <input name="end_time" type="time" class="form-control asset_end_time" placeholder="' . Translation::of('end_time') . '" value="00:00" />
                        <span class="input-icon-addon"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-md" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"></path><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 9 15"></polyline></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">' . Translation::of('duration_in_sec') . '</label>
                  <input name="duration" type="number" class="form-control" value="' . $set['duration'] . '" />
                </div>
                <div class="mb-3">
                  <label class="row">
                    <span class="col">' . Translation::of('active') . '</span>
                    <span class="col-auto">
                      <label class="form-check form-check-single form-switch">
                        <input class="form-check-input" name="active" type="checkbox" checked>
                      </label>
                    </span>
                  </label>
                </div>
              </div>

              <div class="col-md-12 mt-3">
                <div class="mb-3">
                  <label class="form-label">' . Translation::of('players') . '</label>
                  <div class="form-selectgroup form-selectgroup-boxes d-flex flex-column">
                    ' . $playerList . '
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-link mr-auto" data-dismiss="modal">' . Translation::of('close') . '</button>
              <input name="mimetype" type="hidden" value="webpage" />
              <input name="newAsset" type="hidden" value="1" />
              <input name="multidropurl" type="hidden" value="1" />
              <input name="uploadURL" type="submit" class="btn btn-success" value="' . Translation::of('upload') . '" />
            </div>
          </form>
        </div>
        <div class="view_upload tab" style="display: none;">
          <div class="modal-body">
            <form id="dropzoneupload">
              <div class="col-md-12 mb-3">
                <div class="form-group">
                  <div id="imageUpload" class="dropzoneMulti dropzone"></div>
                </div>
              </div>
              <div class="mb-3">
                <div class="form-label">' . Translation::of('asset_settings') . '</div>
                <label class="form-check form-switch">
                  <input class="form-check-input toggle_div" data-src=".defaults_upload" type="checkbox">
                  <span class="form-check-label">' . Translation::of('change_defaults') . '</span>
                </label>
              </div>
              <div class="defaults_upload" style="display: none">
                <div class="row">
                  <div class="col-lg-8">
                    <div class="mb-3">
                      <label class="form-label">' . Translation::of('start') . '</label>
                      <div class="input-icon caltime-padding">
                        <input name="start_date" type="text" value="' . date('Y-m-d', strtotime('now')) . '" class="form-control asset_start" placeholder="' . Translation::of('start_date') . '" />
                        <span class="input-icon-addon"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"/><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="4" y1="11" x2="20" y2="11" /><line x1="11" y1="15" x2="12" y2="15" /><line x1="12" y1="15" x2="12" y2="18" /></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">&nbsp;</label>
                      <div class="input-icon caltime-padding">
                        <input name="start_time" type="text" class="form-control asset_start_time" placeholder="' . Translation::of('start_time') . '" value="00:00" />
                        <span class="input-icon-addon"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-md" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"></path><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 9 15"></polyline></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-8">
                    <div class="mb-3">
                      <label class="form-label">' . Translation::of('end') . '</label>
                      <div class="input-icon caltime-padding">
                        <input name="end_date" type="date" class="form-control asset_end" placeholder="' . Translation::of('end_date') . '" value="' . date('Y-m-d', strtotime('+' . $set['end_date'] . ' week')) . '" />
                        <span class="input-icon-addon"><svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"/><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="16" y1="3" x2="16" y2="7" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="4" y1="11" x2="20" y2="11" /><line x1="11" y1="15" x2="12" y2="15" /><line x1="12" y1="15" x2="12" y2="18" /></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div class="mb-3">
                      <label class="form-label">&nbsp;</label>
                      <div class="input-icon caltime-padding">
                        <input name="end_time" type="time" class="form-control asset_end_time" placeholder="' . Translation::of('end_time') . '" value="00:00" />
                        <span class="input-icon-addon"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-md" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z"></path><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 9 15"></polyline></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">' . Translation::of('duration_in_sec') . '</label>
                  <input name="duration" type="number" class="form-control" value="' . $set['duration'] . '" />
                </div>
                <div class="mb-3">
                  <label class="row">
                    <span class="col">' . Translation::of('active') . '</span>
                    <span class="col-auto">
                      <label class="form-check form-check-single form-switch">
                        <input class="form-check-input" name="active" type="checkbox" checked>
                      </label>
                    </span>
                  </label>
                </div>
              </div>
              <div class="col-md-12 mt-3">
                <div class="mb-3">
                  <label class="form-label">' . Translation::of('players') . '</label>
                  <div class="form-selectgroup form-selectgroup-boxes d-flex flex-column">
                    ' . $playerList . '
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-link mr-auto" data-dismiss="modal">' . Translation::of('close') . '</button>
                <input type="hidden" name="multidrop" id="multidrop" value="1" />
                <input type="hidden" name="test" id="test" value="1" />
                <a id="refresh" href="' . $_moduleLink . '" class="btn btn-info" style="display:none;">' . Translation::of('reload') . '</a>
                <button type="button" id="uploadfiles" class="btn btn-success">' . Translation::of('upload') . '</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>';
}
?>