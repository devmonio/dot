<?php
include (getcwd() . '/../mysqlDBC/MysqlDBC.php');
include (getcwd() . '/../dao/DaoEngine.php');
include (getcwd() . '/../factories/Factory.php');
include (getcwd() . '/../helpers/ArrayHelper.php');
include (getcwd() . '/../messages/Message.php');
include (getcwd() . '/../messages/Confirmation.php');
include (getcwd() . '/../messages/Error.php');
//
//echo json_encode(
//        array('url'=>'tfsdev.visi3d.com',
//            'username'=>'st_configread',
//            'password'=>'passwordconfigread',
//            'name'=>'shoreware'));
 
// <editor-fold defaultstate="collapsed" desc="Constants">
define("COMMAND", "command");
define("DATABASE", "database");

define("url",'url');
define('username','username');
define('password','password');
define('name','name');
// </editor-fold>

class GlobalVariables {
    static public $timetype = '1';
    static public $dnTypes = array(
        1 => 'UserExtension',
        8 => 'Menu',
        9 => 'Workgroup',
        13 => 'RoutePoint',
        22 => 'HuntGroup',
    );
    static public $limitOpCode = 0;
}

if (checkParamGET(COMMAND) /*&& checkParamGET(DATABASE)*/) {
    //$db = $_GET[DATABASE];
    //$dao = new Ctrl($db[url], $db[username], $db[password], $db[name]);
    //$daoEngine = new DaoEngine('tfsdev.visi3d.com', 'st_configread', 'passwordconfigread', 'shoreware');
    $daoEngine = new DaoEngine('localhost', 'root', '', 'shoreware');
    //$daoEngine = new DaoEngine('localhost', 'blueprin_usuario', 'BluePrint1.5', 'blueprin_shoreware');
    //$daoEngine = new DaoEngine('localhost', 'blueprin', '0302-Jcdr', 'blueprin_shoreware');
    switch ($_GET[COMMAND]) {
        case 'connect':
            echo "Connection Established";
            break;
//        case 'getAllDNs':
//            echo json_encode($daoEngine->getAllDNs());
//            break;
        case 'getTrunks': //1
            echo json_encode($daoEngine->getTrunks());
            break;
        case 'getHuntGroups':
            echo json_encode($daoEngine->getHuntGroups());
            break;
        case 'getRoutePoints': 
            echo json_encode($daoEngine->getRoutePoints());
            break;
        case 'getWorkGroups': 
            echo json_encode($daoEngine->getWorkGroups());
            break;
        case 'getMenus':
            echo json_encode($daoEngine->getMenus());
            break;
        case 'getTrunkByDn':
            if (checkParamGET('dn')) {
                $daoEngine->getTrunkgroupById($_GET['dn']);
                echo json_encode($daoEngine->getRootsDnList());
            } else {
                $e = new Error(Error::WebserviceC, 0, 'No dn found');
                echo json_encode($e->getArray());
            }
            break;
        case 'getHuntGroupByDn':
            if (checkParamGET('dn')) {
                $daoEngine->getHuntGroupByDn($_GET['dn']);
                echo json_encode($daoEngine->getRootsDnList());
            } else {
                $e = new Error(Error::WebserviceC, 0, 'No dn found');
                echo json_encode($e->getArray());
            }
            break;
        case 'getMenuByDn':
            if (checkParamGET('dn')) {
                $daoEngine->getMenuByDn($_GET['dn']);
                echo json_encode($daoEngine->getRootsDnList());
            } else {
                $e = new Error(Error::WebserviceC, 0, 'No dn found');
                echo json_encode($e->getArray());
            }
            break;
        case 'getWorkgroupByDn':
            if (checkParamGET('dn')) {
                $daoEngine->getWorkGroupByDn($_GET['dn']);
                echo json_encode($daoEngine->getRootsDnList());
            } else {
                $e = new Error(Error::WebserviceC, 0, 'No dn found');
                echo json_encode($e->getArray());
            }
            break;
        case 'getRoutePointByDn':
            if (checkParamGET('dn')) {
                $daoEngine->getRoutePointByDn($_GET['dn']);
                echo json_encode($daoEngine->getRootsDnList());
            } else {
                $e = new Error(Error::WebserviceC, 0, 'No dn found');
                echo json_encode($e->getArray());
            }
            break;
        case 'getUserExtensionByDn':
            if (checkParamGET('dn')) {
                $daoEngine->getUserExtensionByDn($_GET['dn']);
                echo json_encode($daoEngine->getRootsDnList());
            } else {
                $e = new Error(Error::WebserviceC, 0, 'No dn found');
                echo json_encode($e->getArray());
            }
            break;
//        case 'getDestinationTrunkParents':
//            echo json_encode($daoEngine->getDestinationTrunkParents($_GET['destinationDN']));
//            break;
//        case 'getHuntGroupByDn':
//            echo json_encode($daoEngine->getHuntGroupByDn($_GET['dn']));
//            break;
//        case 'getHuntGroupChildrenByDn' :
//            echo json_encode($daoEngine->getHuntGroupChildrenByDn($_GET['huntGroupDN']));
//            break;

//        case 'getMenuByDn':
//            echo json_encode($daoEngine->getMenuByDn($_GET['timetypeid'], $_GET['dn']));
//            break;
//        case 'getMenuItemsByDn':
//            echo json_encode($daoEngine->getMenuItemsByDn($_GET['menudn'], $_GET['timetypeid']));
//            break;

//        case 'getObjectMenuParents':
//            echo json_encode($daoEngine->getObjectMenuParents($_GET['dn'], $_GET['menuDn'], $_GET['timetypeid']));
//            break;
//        case 'getObjectTrunkParents':
//            echo json_encode($daoEngine->getObjectTrunkParents($_GET['menuDn']));
//            break;
//        case 'getObjectWorkGroupParents':
//            echo json_encode($daoEngine->getObjectWorkGroupParents($_GET['userDN']));
//            break;

//        case 'getShoreTelSLK':
//            echo json_encode($daoEngine->getShoreTelSLK());
//            break;
//        case 'getSwitchesBySiteId':
//            echo json_encode($daoEngine->getSwitchesBySiteId($_GET['siteid']));
//            break;
//        case 'getTrunkgroupsBySiteId': 
//            echo json_encode($daoEngine->getTrunkgroupsBySiteId($_GET['siteID']));
//            break;
//        case 'getTrunkGroupsDNISDID':
//            echo json_encode($daoEngine->getTrunkGroupsDNISDID($_GET['trunkGroupID']));
//            break;
        default:
            echo "Error, service does not exist";
            break;
    }
} else {
    echo "Error";
}

/**
 * Checks the variable exists in the GET array and its not an empty variable
 * @param type $param - key of the POST array
 * @return valid - returns if the variable is valid or not
 */
function checkParamGET($param) {
    if (!isset($_GET[$param]))
        return FALSE;
    if (empty($_GET[$param]))
        return FALSE;

    return TRUE;
}

?>