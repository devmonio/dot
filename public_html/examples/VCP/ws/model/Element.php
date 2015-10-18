<?php
/**
 * Description of Element
 *
 * @author Rodrigo
 */
abstract class Element {
    
    public static $getChildList = array();
    
    private $children;
    private $parents;
    private $dn;
    private $visited;
        
    function __construct($dn) {
        $this->dn = $dn;
        $this->children = array();
        $this->parents = array();
        $this->visited = false;
    }

    abstract function getArray();

    // <editor-fold defaultstate="collapsed" desc="Children">


    /**
     * 
     * @param Element $child
     */
    public function addChild($child) {
        if ($child instanceof Element && !in_array($child, $this->children)){
            $this->children[$child->getDn()] = $child;
        }
    }
    
    public function removeChild($child) {
        if ($child instanceof Element && in_array($child, $this->children)){
            unset($this->children[$child->getDn()]);
        }
    }
    // </editor-fold>
    
    // <editor-fold defaultstate="collapsed" desc="Parents">


    /**
     * 
     * @param Element $parent
     */
    public function addParent($parent) {
        if ($parent instanceof Element && !in_array($parent, $this->parents)) {
            $this->parents[$parent->getDn()] = $parent;
        }
    }

    public function removeParent($parent) {
        if ($parent instanceof Element && in_array($parent, $this->parents)) {
            unset($this->parents[$parent->getDn()]);
        }
    }
    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="Gets and Sets">

    public function getChildren() {
        if (key_exists($this->getDn(), Element::$getChildList)){
            $array = array();
            foreach ($this->children as $child){
                array_push($array, $child->getDn());
            }
            return $array;
        }
        Element::$getChildList[$this->getDn()] = $this;
        return $this->children;
    }

    public function setChildren($children) {
        $this->children = $children;
    }

    public function getParent() {
        return $this->parents;
    }

    public function setParent($parent) {
        $this->parents = $parent;
    }

    public function getDn() {
        return $this->dn;
    }

    public function setDn($dn) {
        $this->dn = $dn;
    }
    
    public function getVisited() {
        return $this->visited;
    }

    public function setVisited($visited) {
        $this->visited = $visited;
    }
    public function getParents() {
        return $this->parents;
    }

    public function setParents($parents) {
        $this->parents = $parents;
    }
// </editor-fold>
}

?>
