<?php
/**
 * Description of Trunk
 *
 * @author RodrigoLaptop
 */
class UserExtension extends Element{

    private $description;
    private $did;

    function __construct($dn, $description, $did) {
        parent::__construct($dn);
        $this->description = $description;
        $this->did = $did;
    }
    
    function getArray() {
        return array( 
            'UserExtension' => array(
                'dn' => $this->getDn(),
                'description' => $this->description,
                'did' => $this->did
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
