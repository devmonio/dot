<?php
/**
 * Description of Trunk
 *
 * @author RodrigoLaptop
 */
class Trunk extends Element{

    private $name;
    private $trunkType;
    private $areaCode;
    private $destinationDn;
    private $menuDn;
    
    function __construct($dn, $name, $trunkType, $areaCode, $destinatinoDn, $menuDn) {
        parent::__construct($dn);
        $this->name = $name;
        $this->trunkType = $trunkType;
        $this->areaCode = $areaCode;
        $this->destinationDn = $destinatinoDn;
        $this->menuDn = $menuDn;
    }
    
    function getArray() {
        return array( 
            'Trunk' => array(
            'dn' => $this->getDn(),
            'name' => $this->name,
            'trunkType' => $this->trunkType,
            'areaCode' => $this->areaCode,
            'destinationDn' => $this->destinationDn,
            'menuDn' => $this->menuDn,
            'children' => ArrayHelper::getArray($this->getChildren())
            ));
        
    }
    
    // <editor-fold defaultstate="collapsed" desc="Gets and Sets">
    
    public function setDn($dn) {
        $this->dn = $dn;
    }

    public function getName() {
        return $this->name;
    }

    public function setName($name) {
        $this->name = $name;
    }

    public function getTrunkType() {
        return $this->trunkType;
    }

    public function setTrunkType($trunkType) {
        $this->trunkType = $trunkType;
    }

    public function getDestinationDn() {
        return $this->destinationDn;
    }

    public function setDestinationDn($destinatinoDn) {
        $this->destinationDn = $destinatinoDn;
    }

    public function getMenuDn() {
        return $this->menuDn;
    }

    public function setMenuDn($menuDn) {
        $this->menuDn = $menuDn;
    }
    
    // </editor-fold>
}

?>
