<?php
require_once('translation.php');
use Translation\Translation;

Translation::setLocalesDir(__DIR__ . '/../locales');

$_moduleName = 'Assets Management';
$_moduleLink = 'index.php?site=assets';
$uploadDir = __DIR__ . '/../data/upload/images';

function getAssetsQuery($withPlayerCount = true)
{
  global $db;
  $sql = "SELECT %s FROM assets ORDER BY created DESC";
  if ($withPlayerCount == true) {
    $sql = sprintf($sql, "*, (SELECT COUNT(assetID) FROM asset_player WHERE asset_player.assetID = assets.assetID) playerCount");
  } else {
    $sql = sprintf($sql, '*');
  }
  $query = $db->query($sql);
  return $query;
}

function getAsset($assetID)
{
  global $db;
  $assetSQL = $db->query("SELECT * FROM assets WHERE assetID='" . $assetID . "'");
  return $assetSQL->fetchArray(SQLITE3_ASSOC);
}

function getAssetName($assetID)
{
  $asset = getAsset($assetID);
  return $asset['title'];
}

function deleteAsset($assetID)
{
  global $db;
  // delete the asset player
  $db->exec(sprintf("DELETE FROM asset_player WHERE assetID='%s'", $assetID));

  $db->exec(sprintf("DELETE FROM assets WHERE assetID='%s'", $assetID));
}

function addAsset($title, $type, $url)
{
  global $db;
  $db->exec(sprintf("INSERT INTO assets (title, type, url) VALUES('%s', '%s', '%s')"));
}

function deleteAssetFile($assetID)
{
  $assetName = getAssetName($assetID);
  global $uploadDir;
  $assetFile = $uploadDir . '/' . $assetName;
  if (file_exists($assetFile)) {
    unlink($assetFile);
  }
}

function removeAssetAndFile($assetID)
{
  deleteAssetFile($assetID);
  deleteAsset($assetID);
}

if (isset($_GET['site']) && $_GET['site'] == 'assets' && isset($_GET['action']) && $_GET['action'] == 'delete-asset') {
  $assetID = $_GET['assetID'];

  if (isset($assetID)) {
    removeAssetAndFile($assetID);
    sysinfo('success', 'Asset delete succesfully.');
  } else {
    sysinfo('danger', 'Failed to delete asset');
  }
  redirect('index.php?site=assets');
}
?>