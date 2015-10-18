<?php

/**
 * Description of DAO
 *
 * @author 
 */

include (getcwd() . '/../model/Element.php');
include (getcwd() . '/../model/Trunk.php');
include (getcwd() . '/../model/Menu.php');
include (getcwd() . '/../model/MenuItem.php');
include (getcwd() . '/../model/UserExtension.php');
include (getcwd() . '/../model/Workgroup.php');
include (getcwd() . '/../model/RoutePoint.php');
include (getcwd() . '/../model/HuntGroup.php');

class DaoEngine {

    private $connection;
    private $dnTypes = array(
    1 => 'UserExtension',
    8 => 'Menu',
    9 => 'Workgroup',
    13 => 'RoutePoint',
    22 => 'HuntGroup',
    );
    
    private $dnList = array();
    
    //Establishing connection db
    public function __construct($url, $username, $password, $name) {
        $this->connection = new MysqlDBC($url, $username, $password, $name);
        $this->connection->connect();
    }

    public function getAllDNs($dn){
        $sql = "SELECT dn, dntypeid FROM dn WHERE dn = '".$dn."' ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    // <editor-fold defaultstate="collapsed" desc="Fill by DN">
 
    // <editor-fold defaultstate="collapsed" desc="Trunk">
       
    public function getTrunkgroupById($dn){
        if (key_exists($dn, $this->dnList)){
            return $this->dnList[$dn];
        }
        $result = $this->connection->getResult(
                "SELECT TrunkGroupId, TrunkGroupName, TrunkTypeId, AreaCode, DestinationDN, MenuDN  
                    FROM trunkgroups t 
                    WHERE TrunkGroupID = '$dn'");
        $trunk = Factory::getTrunk($result->fetch_object());
        $this->dnList[$trunk->getDn()] = $trunk;
        
        if ($trunk->getMenuDn() != null) {
            if (key_exists($trunk->getMenuDn(), $this->dnList)){
                $trunk->addChild($this->dnList[$trunk->getMenuDn()]);
            }else{
                $trunk->addChild($this->getMenuByDn($trunk->getMenuDn()));
            }
        } else if ($trunk->getDestinationDn() != null) {
            if (key_exists($trunk->getDestinationDn(), $this->dnList)){
                $trunk->addChild($this->dnList[$trunk->getDestinationDn()]);
            }else{
                // Since its not a menu it looks for the other destinations
                $trunk->addChild($this->fillDn($trunk->getDestinationDn()));
            }
        }
        return $trunk;
    }

    // </editor-fold>
    
    // <editor-fold defaultstate="collapsed" desc="Menu">
    /**
     * 
     * @param Element $parent
     * @param type $dn
     */
    public function getMenuByDn($dn) {
        if (key_exists($dn, $this->dnList)){
            return $this->dnList[$dn];
        }
        $timetypeid = GlobalVariables::$timetype;

        $sql = "SELECT dn.dn, description, dntypeid, submenus.prompttext, prompts.filename 
                    FROM dn LEFT OUTER JOIN submenus ON dn.dn = submenus.menudn 
                    AND submenus.prompttext IS NOT NULL and timetypeid = '$timetypeid' 
                            LEFT OUTER JOIN prompts ON submenus.promptid = prompts.promptid 
                            AND prompts.filename IS NOT NULL 
                                WHERE dn.dn = '$dn'";
        
        $result = $this->connection->getResult($sql);
        $menu = Factory::getMenu($result->fetch_object());
        $this->dnList[$menu->getDn()] = $menu;
        $this->getMenuItemsByDn($menu);
        
        // Check for parents
        $this->checkIfMenuParent($menu, $dn);
        $this->checkIfTrunkParent($menu, $dn);
        
        return $menu;
    }
    
    /**
     * 
     * @param Menu $menu
     * @param type $timetypeid
     * @return array
     */
    public function getMenuItemsByDn($menu){
        $menuDn = $menu->getDn();
        $timetypeid = GlobalVariables::$timetype;
        $sql = "SELECT keypadid, opcodeid, dn, extensionlistid 
                    FROM submenuitems 
                    WHERE menudn = '$menuDn' 
                    AND timetypeid = '$timetypeid'";
        
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            $menuItem = Factory::getMenuItem($menu,$row);
            $this->dnList[$menu->getDn().$menuItem->getKeypadid()] = $menuItem;
            $menu->addChild($menuItem);
            $menuItem->addParent($menu);
            array_push($array, $menuItem);
        }
        
        foreach ($array as $mi) {
            if ($mi->getKeypadid() <= 9 || !GlobalVariables::$limitOpCode) {
                $mi->addChild($this->fillDn($mi->getDn2()));
            }
        }
    }

    // </editor-fold>
    
    // <editor-fold defaultstate="collapsed" desc="User Extension">
    /**
     * @param Element $parent
     * @param type $dn
     */
    public function getUserExtensionByDn($dn) {
        if (key_exists($dn, $this->dnList)){
            return $this->dnList[$dn];
        }
        $result = $this->connection->getResult(
                "SELECT dn, description, 
                        (SELECT Digits 
                            FROM diddigitmap 
                            WHERE DN = '$dn' LIMIT 1) as did 
                    FROM dn 
                    WHERE dn.dn = '$dn'");
        
        $userExtension = Factory::getUserExtension($result->fetch_object());
        $this->dnList[$userExtension->getDn()] = $userExtension;
        
        $this->checkIfMenuParent($userExtension, $dn);
        $result = $this->connection->getResult(
                "SELECT HuntGroupDN as ParentDN 
                    FROM huntgroupmembers h 
                    WHERE UserDN = '$dn'");
        while ($row = $result->fetch_object()) {
            if (key_exists($row->ParentDN, $this->dnList)) {
                $userExtension->addParent($this->dnList[$row->ParentDN]);
            } else {
                $userExtension->addParent($this->getHuntGroupByDn($row->ParentDN));
            }
        }
        return $userExtension;
    }

    // </editor-fold>
    
    // <editor-fold defaultstate="collapsed" desc="Workgroup">
    /**
     * 
     * @param Element $parent
     * @param type $dn
     * @return type
     */
    public function getWorkGroupByDn($dn) {
        if (key_exists($dn, $this->dnList)){
            return $this->dnList[$dn];
        }
        $timetypeid = GlobalVariables::$timetype;
        $sql = "SELECT dn.dn, chm.huntpatternid, wg.backupdn, chm.cfbusy, 
            chm.cfnoanswer,chm.cfalways, chm.cfdnnologgedinagent, chm.cfnarings, chm.cfhuntnarings,
            wg.usergroupid, dn.Description, chm.cfconditionid 
                        FROM workgroups wg
                        JOIN workgroupchm chm on chm.WorkgroupDn = wg.WorkGroupDn
                        JOIN dn on dn.Dn = wg.WorkGroupDn
                        WHERE wg.workgroupdn = '$dn'
                            AND chm.TimeTypeId = '$timetypeid'";
        $result = $this->connection->getResult($sql);
        
        $workgroup = Factory::getWorkGroup($result->fetch_object());
        $this->dnList[$workgroup->getDn()] = $workgroup;
        
        if ($workgroup->getCfalways() != null){
            $workgroup->addChild($this->fillDn($workgroup->getCfalways()));
        }
        if ($workgroup->getCfbusy() != null){
            $workgroup->addChild($this->fillDn($workgroup->getCfbusy()));
        }
        if ($workgroup->getCfnoanswer() != null){
            $workgroup->addChild($this->fillDn($workgroup->getCfnoanswer()));
        }
        if ($workgroup->getCfdnnologgedinagent() != null){
            $workgroup->addChild($this->fillDn($workgroup->getCfdnnologgedinagent()));
        }
        
        // Check for parents
        $this->checkIfMenuParent($workgroup, $dn);
        $this->checkIfTrunkParent($workgroup, $dn);
        $this->checkIfWorkgroupParent($workgroup, $dn);
        
        return $workgroup;
    }
    // </editor-fold>
    
    // <editor-fold defaultstate="collapsed" desc="RoutePoint">
    /**
     * 
     * @param Element $parent
     * @param type $dn
     * @return type
     */
    public function getRoutePointByDn($dn) {
        if (key_exists($dn, $this->dnList)){
            return $this->dnList[$dn];
        }
        $timetypeid = GlobalVariables::$timetype;
        $sql = "SELECT dn.dn, wg.WorkgroupDN, chm.huntpatternid, wg.backupdn, chm.cfbusy, chm.cfnoanswer,chm.cfalways,
            chm.cfdnnologgedinagent, chm.cfnarings, chm.cfhuntnarings, wg.usergroupid, dn.Description, chm.cfconditionid 
            FROM workgroups wg
            JOIN workgroupchm chm on chm.WorkgroupDn = wg.WorkGroupDn
            JOIN dn on dn.Dn = wg.WorkGroupDn
            WHERE wg.workgroupdn = '$dn' 
            AND chm.TimeTypeId = '$timetypeid'";
        $result = $this->connection->getResult($sql);
 
        $RoutePoint = Factory::getRoutePoint($result->fetch_object());
        $this->dnList[$RoutePoint->getDn()] = $RoutePoint;
        
        if ($RoutePoint->getCfalways() != null){
            $RoutePoint->addChild($this->fillDn($RoutePoint->getCfalways()));
        }
        if ($RoutePoint->getCfbusy() != null){
            $RoutePoint->addChild($this->fillDn($RoutePoint->getCfbusy()));
        }
        if ($RoutePoint->getCfnoanswer() != null){
            $RoutePoint->addChild($this->fillDn($RoutePoint->getCfnoanswer()));
        }
        if ($RoutePoint->getCfdnnologgedinagent() != null){
            $RoutePoint->addChild($this->fillDn($RoutePoint->getCfdnnologgedinagent()));
        }
        
        // Check for parents
        $this->checkIfMenuParent($RoutePoint, $dn);
        $this->checkIfTrunkParent($RoutePoint, $dn);
        $this->checkIfWorkgroupParent($RoutePoint, $dn);
        
        return $RoutePoint;
    }
    // </editor-fold>
    
    // <editor-fold defaultstate="collapsed" desc="HuntGroup">
    
    public function getHuntGroupByDn($dn){
        if (key_exists($dn, $this->dnList)){
            return $this->dnList[$dn];
        }
        $result = $this->connection->getResult(
                "SELECT dn.dn, description, dntypeid, hpf.RingsPerMember, hpf.huntpatternid, hpf.backupdn, hpf.cfbusy, hpf.cfnoanswer 
                    FROM dn LEFT OUTER JOIN huntandpagingfeatures hpf ON dn.dn = hpf.listdn 
                    WHERE dn='$dn'");        
        $HuntGroup = Factory::getHuntGroup($result->fetch_object());
        $this->dnList[$HuntGroup->getDn()] = $HuntGroup;
        $this->getHuntGroupChildren($HuntGroup);
        
        //Check for parents
        $this->checkIfMenuParent($HuntGroup, $dn);
        $this->checkIfTrunkParent($HuntGroup, $dn);
        
        return $HuntGroup;
    }
    
    /**
     * 
     * @param HuntGroup $parent
     */
    public function getHuntGroupChildren($parent){
        $dn = $parent->getDn();
        $result = $this->connection->getResult(
                "SELECT UserDN FROM huntgroupmembers h 
                    WHERE HuntGroupDN = '$dn' ORDER BY huntorder;");
        while ($row = $result->fetch_object()){
            $parent->addChild($this->getUserExtensionByDn($row->UserDN));
        }
    }
    // </editor-fold>
    
    // <editor-fold defaultstate="collapsed" desc="Fill parent by DN">
    /**
     * 
     * @param Element $parent
     * @param type $dn
     * @return type
     */
    public function fillDn($dn) {
        if (key_exists($dn, $this->dnList)){
            return $this->dnList[$dn];
        }
        $result = $this->connection->getResult(
                "SELECT DN,DNTypeID FROM dn WHERE dn = '$dn'");
        $row = $result->fetch_object();
        if ($row == null) {
            return;
        }
        $child = NULL;
        if (key_exists($row->DNTypeID, GlobalVariables::$dnTypes)){
            switch (GlobalVariables::$dnTypes[$row->DNTypeID]) {
                case 'UserExtension':
                    $child = $this->getUserExtensionByDn($row->DN);
                    break;
                case 'Workgroup':
                    $child = $this->getWorkGroupByDn($row->DN);
                    break;
                case 'RoutePoint':
                    $child = $this->getRoutePointByDn($row->DN);
                    break;
                case 'HuntGroup':
                    $child = $this->getHuntGroupByDn($row->DN);
                    break;
                case 'Menu':
                    $child = $this->getMenuByDn($row->DN);
                    break;
                default:
                    $e = new Error(Error::LogicC, 0, "DestinationType doesnt exist");
                    return $e->getArray();
                    break;
            }
        }
        return $child;
    }
    
    public function checkIfTrunkParent($element,$dn) {
        $result = $this->connection->getResult(
                "SELECT trunkgroupId as ParentDN 
                    FROM trunkgroups where DestinationDN = '$dn'"
        );
        while ($row = $result->fetch_object()) {
            if (key_exists($row->ParentDN, $this->dnList)) {
                $element->addParent($this->dnList[$row->ParentDN]);
            }else{
                $element->addParent($this->getTrunkgroupById($row->ParentDN));
            }
        }
    }
    
    public function checkIfMenuParent($element, $dn){
        $timetypeid = GlobalVariables::$timetype;
        
        $result = $this->connection->getResult(
                "SELECT menudn as ParentDN, KeypadID
                        FROM submenuitems smi 
                        WHERE dn = '$dn' 
                        AND MenuDn != '$dn' 
                        AND timetypeid = '$timetypeid'"
        );

        while ($row = $result->fetch_object()) {
            if (key_exists($row->ParentDN.$row->KeypadID, $this->dnList)) {
                $element->addParent($this->dnList[$row->ParentDN.$row->KeypadID]);
            }else{
                $element->addParent($this->getMenuByDn($row->ParentDN));
            }
        }
    }
    
    public function checkIfWorkgroupParent($element,$dn) {
        $result = $this->connection->getResult(
                "SELECT workgroupdn as ParentDN
                    FROM workgroupmembers w 
                    WHERE UserDN = '$dn'"
        );
        while ($row = $result->fetch_object()) {
            if (key_exists($row->ParentDN, $this->dnList)) {
                $element->addParent($this->dnList[$row->ParentDN]);
            }else{
                $element->addParent($this->getWorkGroupByDn($row->ParentDN));
            }
        }
    }
    
    // </editor-fold>
    
    public function getRootsDnList() {
        $array = array();
        foreach ($this->dnList as $Element){
            if (count($Element->getParents()) == 0){
                array_push($array, $Element->getArray());
            }
        }
        return $array;
    }
    
    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="Extra">

    public function getDestinationTrunkParents($destinationDN){
        $sql = "SELECT trunkgroupId as ParentDN  FROM trunkgroups where DestinationDN = '".$destinationDN."' "; //
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getObjectTrunkParents($menuDn){
        $sql = "SELECT trunkgroupId as ParentDN FROM trunkgroups where menudn = '".$menuDn."' ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getTrunkgroupsBySiteId($siteID){
        $sql = "SELECT TrunkGroupId, TrunkGroupName, TrunkTypeId, AreaCode, DestinationDN, MenuDN  
                    FROM trunkgroups t 
                            WHERE SiteID = '".$siteID."' ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
        
    public function getHuntGroupChildrenByDn($huntGroupDN){
        $sql = "SELECT UserDN FROM huntgroupmembers h WHERE HuntGroupDN = '".$huntGroupDN."' ORDER BY huntorder";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
        
    public function getObjectMenuParents($dn, $menuDn, $timetypeid){
        $sql = "SELECT menudn as ParentDN 
                    from submenuitems smi 
                            where dn = '".$dn."' and MenuDn != '".$menuDn."' and timetypeid = '".$timetypeid."' ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getObjectWorkGroupParents($userDN){
        $sql = "SELECT workgroupdn as ParentDN FROM workgroupmembers w where UserDN = '".$userDN."' ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getShoreTelSLK(){
        $sql = "SELECT licensekey from LicenseKeys where CHAR_LENGTH(licensekey) = 32 ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getSwitchesBySiteId($siteId){
        $sql = "SELECT SwitchId, SwitchTypeId, SwitchName, HostName, IpAddress, SerialNum, SwitchGroupName, s.SwitchGroupId 
                    FROM switches s join switchgroups sg on sg.SwitchGroupId = s.SwitchGroupId 
                        WHERE sg.siteid = '".$siteId."' ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getTrunkGroupsDNISDID($trunkGroupID){
        $sql = "(SELECT if(diddigitmap.dn = 1100,diddigitmap.menudn,diddigitmap.dn) as dn,
                        (SELECT BasePhoneNumber
                                   FROM didranges
                                               WHERE DIDRangeID = diddigitmap.DIDRangeID) AS BasePhoneNumber,
                                                    CONCAT('DID:',Digits) as Digits,dntypes.Description,dn.Description as Name
                                                        FROM diddigitmap,dn,dntypes
                                                            WHERE  if(diddigitmap.dn = 1100, diddigitmap.menudn,diddigitmap.dn) = dn.DN
                                                                AND dn.DNTypeID = dntypes.DNTypeID
                                                                AND TrunkGroupID = '".$trunkGroupID."'  
                                                                HAVING BasePhoneNumber IS NOT NULL
                                                                )UNION(
                                                                        SELECT if(digitmap.dn = 1100,digitmap.menudn,digitmap.dn) as dn,digitmap.Description as BasePhoneNumber, CONCAT('DNIS:',Digits) as Digits, dntypes.Description, dn.Description as Name
                                                                            FROM diddigitmap as digitmap,dn,dntypes
                                                                                WHERE  if(digitmap.dn = 1100,digitmap.menudn,digitmap.dn) = dn.DN
                                                                                AND dn.DNTypeID = dntypes.DNTypeID
                                                                                AND digitmap.TrunkGroupID = '".$trunkGroupID."'
                                                                                HAVING (SELECT DN FROM diddigitmap
                                                                                    WHERE digitmap.DN = diddigitmap.DN
                                                                                    AND digitmap.TrunkGroupID = diddigitmap.TrunkGroupID LIMIT 1)
                                                                                    IS NOT NULL and BasePhoneNumber is not null
                                                                                        ) ORDER BY 3 DESC ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getUserCount(){
        $sql = "SELECT count(1) as UserCount FROM dn d where dntypeid = 1 or dntypeid = 20 ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getUserExtension_HuntGroupParents($userDN){
        $sql = "SELECT HuntGroupDN as ParentDN FROM huntgroupmembers h WHERE UserDN = '".$userDN."' ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
           
    public function getWorkGroupAgents($WorkgroupDn){
        $sql = "SELECT w.UserDn, d.description FROM workgroupmembers w join dn d on d.dn = w.userdn where WorkgroupDn =  '".$WorkgroupDn."' ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    

    
    // </editor-fold>
    
    // <editor-fold defaultstate="collapsed" desc="Get List of Elements">

    public function getTrunks() {
        $sql = "SELECT TrunkGroupId, TrunkGroupName, TrunkTypeId, AreaCode , DestinationDN, MenuDN
                    FROM trunkgroups";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            $trunk = Factory::getTrunk($row);
            array_push($array, $trunk);
        }
        return ArrayHelper::getArray($array);
    }
    
    public function getMenus(){
        $sql = "SELECT Dn, Description FROM dn d where DNTypeId = '8' ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return ArrayHelper::getArray($array);
    }
    
    public function getRoutePoints(){
        $sql = "SELECT Dn, Description FROM dn d where DNTypeId = 13 ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getHuntGroups(){
        $sql = "SELECT Dn, Description FROM dn d where DNTypeId = 22";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    
    public function getUserExtensions(){
        $sql = "SELECT Dn, Description FROM dn d where DNTypeId = 1";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
        
    }
    
    public function getWorkGroups(){
        $sql = "SELECT Dn, Description FROM dn d where DNTypeId = 9 ";
        $result = $this->connection->getResult($sql);
        $array = array();
        while ($row = $result->fetch_object()) {
            array_push($array, $row);
        }
        return $array;
    }
    // </editor-fold>
}

?>
