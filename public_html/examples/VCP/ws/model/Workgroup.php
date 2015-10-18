<?php
/**
 * Description of Trunk
 *
 * @author RodrigoLaptop
 */
class Workgroup extends Element{

    private $description;
    private $huntpatternid;
    private $backupdn;
    private $cfbusy;
    private $cfnoanswer;
    private $cfalways;
    private $cfdnnologgedinagent;
    private $cfnarings;
    private $cfhuntnarings;
    private $usergroupid;
    private $cfconditionid;
    
    function __construct($dn, $description, $huntpatternid, $backupdn, $cfbusy, $cfnoanswer, $cfalways, 
            $cfdnnologgedinagent, $cfnarings, $cfhuntnarings, $usergroupid, $cfconditionid) {
        parent::__construct($dn);
        $this->description = $description;
        $this->huntpatternid = $huntpatternid;
        $this->backupdn = $backupdn;
        $this->cfbusy = $cfbusy;
        $this->cfnoanswer = $cfnoanswer;
        $this->cfalways = $cfalways;
        $this->cfdnnologgedinagent = $cfdnnologgedinagent;
        $this->cfnarings = $cfnarings;
        $this->cfhuntnarings = $cfhuntnarings;
        $this->usergroupid = $usergroupid;
        $this->cfconditionid = $cfconditionid;
    }

    function getArray() {
        return array( 
            'Workgroup' => array(
                'dn' => $this->getDn(),
                'description' => $this->description,
                'huntpatternid' => $this->huntpatternid,
                'backupdn' => $this->backupdn,
                'cfbusy' => $this->cfbusy,
                'cfnoanswer' => $this->cfnoanswer,
                'cfalways' => $this->cfalways,
                'cfdnnologgedinagent' => $this->cfdnnologgedinagent,
                'cfnarings' => $this->cfnarings,
                'cfhuntnarings' => $this->cfhuntnarings,
                'usergroupid' => $this->usergroupid,
                'cfconditionid' => $this->cfconditionid,
                'children' => ArrayHelper::getArray($this->getChildren())
            ));
    }
    
    // <editor-fold defaultstate="collapsed" desc="Gets and Sets">

    public function getDescription() {
        return $this->description;
    }

    public function setDescription($description) {
        $this->description = $description;
    }

    public function getHuntpatternid() {
        return $this->huntpatternid;
    }

    public function setHuntpatternid($huntpatternid) {
        $this->huntpatternid = $huntpatternid;
    }

    public function getBackupdn() {
        return $this->backupdn;
    }

    public function setBackupdn($backupdn) {
        $this->backupdn = $backupdn;
    }

    public function getCfbusy() {
        return $this->cfbusy;
    }

    public function setCfbusy($cfbusy) {
        $this->cfbusy = $cfbusy;
    }

    public function getCfnoanswer() {
        return $this->cfnoanswer;
    }

    public function setCfnoanswer($cfnoanswer) {
        $this->cfnoanswer = $cfnoanswer;
    }

    public function getCfalways() {
        return $this->cfalways;
    }

    public function setCfalways($cfalways) {
        $this->cfalways = $cfalways;
    }

    public function getCfdnnologgedinagent() {
        return $this->cfdnnologgedinagent;
    }

    public function setCfdnnologgedinagent($cfdnnologgedinagent) {
        $this->cfdnnologgedinagent = $cfdnnologgedinagent;
    }

    public function getCfnarings() {
        return $this->cfnarings;
    }

    public function setCfnarings($cfnarings) {
        $this->cfnarings = $cfnarings;
    }

    public function getCfhuntnarings() {
        return $this->cfhuntnarings;
    }

    public function setCfhuntnarings($cfhuntnarings) {
        $this->cfhuntnarings = $cfhuntnarings;
    }

    public function getUsergroupid() {
        return $this->usergroupid;
    }

    public function setUsergroupid($usergroupid) {
        $this->usergroupid = $usergroupid;
    }

    public function getCfconditionid() {
        return $this->cfconditionid;
    }

    public function setCfconditionid($cfconditionid) {
        $this->cfconditionid = $cfconditionid;
    }
    
    // </editor-fold>
}

?>
