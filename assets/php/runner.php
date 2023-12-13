<?php
/*
                            _
   ____                    | |
  / __ \__      _____  _ __| | __ ____
 / / _` \ \ /\ / / _ \| '__| |/ /|_  /
| | (_| |\ V  V / (_) | |  |   <  / /
 \ \__,_| \_/\_/ \___/|_|  |_|\_\/___|
  \____/

        http://www.atworkz.de
           info@atworkz.de
_______________________________________

       Freebits Signage Monitoring
            Runner Script
_______________________________________
*/


$_TEST = FALSE;  # TRUE / FALSE


chdir('../../');
include_once("_functions.php");

$now = time();

if(isset($_GET['mode']) && $_GET['mode'] == 'addon'){
  if($_GET['player'] != '' AND $_GET['state'] == 'end'){
    $logFile = file_get_contents(basename('/var/www/html/assets/tmp/'.$_GET['player'].'.txt'));
    $log = unserialize($logFile);
    @unlink('/var/www/html/assets/tmp/'.$_GET['player'].'.txt');
    $logoutput = SQLite3::escapeString($log['output']);
    $db->exec("UPDATE `player` SET logOutput='".$logoutput."' WHERE address='".$log['player']."'");
    systemLog('Add-On', 'Installation on '.$log['player'].' finished', $log['userID'], 1);
  }
  else if($_GET['player'] != '' && $_GET['state'] == 'start') {
    $db->exec("UPDATE `player` SET logOutput='[START] Installation of SOMA Add-on...' WHERE address='".$_GET['player']."'");
    systemLog('Add-On', 'Installation on '.$_GET['player'].' started', $_GET['uid'], 1);
  }
}
else {

  $playerSQL = $db->query("SELECT * FROM player");
  while($player	= $playerSQL->fetchArray(SQLITE3_ASSOC)){
    $id = $player['playerID'];
    $name = $player['name'];
    $ip   = $player['address'];



    // SET Status offline
    $db->exec("UPDATE `player` SET assets='' WHERE playerID='".$id."'");
    $db->exec("UPDATE `player` SET status='0' WHERE playerID='".$id."'");
    $db->exec("UPDATE `player` SET bg_sync='".$now."' WHERE playerID='".$id."'");

    if(checkAddress($ip)){

      // SET Status online
      $db->exec("UPDATE `player` SET status='1' WHERE playerID='".$id."'");

      if(checkAddress($ip.'/api/docs/')){
        if($_TEST) echo $name.'<br />';

        // GET Assets
        $playerAssets = getApiData($player['address'].'/api/'.$apiVersion.'/assets', $id);
        if(strpos($playerAssets, 'error') === false) {
          $db->exec("UPDATE `player` SET assets='".$playerAssets."' WHERE playerID='".$id."'");
          if($_TEST) echo $playerAssets.'<br />';
        }

        // GET monitorOutput Version

        $db->exec("UPDATE `player` SET monitorOutput='0' WHERE playerID='".$id."'");
        $db->exec("UPDATE `player` SET deviceInfo='0' WHERE playerID='".$id."'");

        if(checkAddress($ip.':9020/screen/screenshot.png')){
          $db->exec("UPDATE `player` SET monitorOutput='1.0' WHERE playerID='".$id."'");
          if($_TEST) echo '1.0 <br />';
        }

        if(checkAddress($ip.':9020/version')){
          $apiVM = getApiData($ip.':9020/version', $id);
          if($apiVM != '')$db->exec("UPDATE `player` SET monitorOutput='".$apiVM."' WHERE playerID='".$id."'");
          if($_TEST) echo $apiVM.'<br />';
        }


        // GET deviceInfo Version
        if(checkAddress($ip.':9021/version')){
          $apiVD = getApiData($ip.':9021/version', $id);
          if($apiVD != '')$db->exec("UPDATE `player` SET deviceInfo='".$apiVD."' WHERE playerID='".$id."'");
          if($_TEST) echo $apiVD.'<br />';
        }
      }
    }
  }
}
