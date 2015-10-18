<?php
/**
 * Description of Trunk
 *
 * @author RodrigoLaptop
 */
class HuntGroup extends Element{

    private $description;
    private $ringsPerMember;
    private $huntpatternid;
    private $backupdn;
    private $cfbusy;
    private $cfnoanswer;
    
    function __construct($dn, $description, $ringsPerMember, $huntpatternid, $backupdn, $cfbusy, $cfnoanswer) {
        parent::__construct($dn);
        $this->description = $description;
        $this->ringsPerMember = $ringsPerMember;
        $this->huntpatternid = $huntpatternid;
        $this->backupdn = $backupdn;
        $this->cfbusy = $cfbusy;
        $this->cfnoanswer = $cfnoanswer;
    }

    function getArray() {
        return array( 
            'HuntGroup' => array(
                'dn' => $this->getDn(),
                'description' => $this->description,
                'ringsPerMember' => $this->ringsPerMember,
                'huntpatternid' => $this->huntpatternid,
                'backupdn' => $this->backupdn,
                'cfbusy' => $this->cfbusy,
                'cfnoanswer' => $this->cfnoanswer,
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

    public function getRingsPerMember() {
        return $this->ringsPerMember;
    }

    public function setRingsPerMember($ringsPerMember) {
        $this->ringsPerMember = $ringsPerMember;
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

    // </editor-fold>
}

?>
