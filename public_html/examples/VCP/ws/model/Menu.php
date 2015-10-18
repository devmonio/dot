<?php
/**
 * Description of Trunk
 *
 * @author RodrigoLaptop
 */
class Menu extends Element{

    private $description;
    private $prompt;
    private $filename;

    function __construct($dn, $description, $prompt, $filename) {
        parent::__construct($dn);
        $this->description = $description;
        $this->prompt = $prompt;
        $this->filename = $filename;
    }
    
    function getArray() {
        return array( 
            'Menu' => array(
            'dn' => $this->getDn(),
            'description' => $this->description,
            'prompt' => $this->prompt,
            'filename' => $this->filename,
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

    public function getPrompt() {
        return $this->prompt;
    }

    public function setPrompt($prompt) {
        $this->prompt = $prompt;
    }

    public function getFilename() {
        return $this->filename;
    }

    public function setFilename($filename) {
        $this->filename = $filename;
    }

    // </editor-fold>
}

?>
