<?php
/**
 * Description of Trunk
 *
 * @author RodrigoLaptop
 */
class MenuItem extends Element{

    private $keypadid;
    private $opcodeid;
    private $dn2;
    private $extensionlistid;

    function __construct($dn, $keypadid, $opcodeid, $dn2, $extensionlistid) {
        parent::__construct($dn);
        $this->keypadid = $keypadid;
        $this->opcodeid = $opcodeid;
        $this->dn2 = $dn2;
        $this->extensionlistid = $extensionlistid;
    }

    function getArray() {
        
        return array( 
            'MenuItem' => array(
                'dn' => $this->getDn(),
                'keypadid' => $this->keypadid,
                'opcodeid' => $this->opcodeid,
                'dn2' => $this->dn2,
                'extensionlistid' => $this->extensionlistid,
                'children' => ArrayHelper::getArray($this->getChildren())
            ));
        
    }
    
    // <editor-fold defaultstate="collapsed" desc="Gets and Sets">
    public function getKeypadid() {
        return $this->keypadid;
    }

    public function setKeypadid($keypadid) {
        $this->keypadid = $keypadid;
    }

    public function getOpcodeid() {
        return $this->opcodeid;
    }

    public function setOpcodeid($opcodeid) {
        $this->opcodeid = $opcodeid;
    }

    public function getDn2() {
        return $this->dn2;
    }

    public function setDn2($dn2) {
        $this->dn2 = $dn2;
    }

    public function getExtensionlistid() {
        return $this->extensionlistid;
    }

    public function setExtensionlistid($extensionlistid) {
        $this->extensionlistid = $extensionlistid;
    }

    // </editor-fold>
}

?>
