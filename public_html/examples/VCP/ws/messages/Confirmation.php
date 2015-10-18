<?php

/**
 * Description of Confirmation
 *
 * @author Rodrigo
 */
class Confirmation extends Message{

    const type = "confirmation";
    const entityId = "id";
    const keyMessage = "message";
    
    private $message;
    private $id;
    public function __construct($id, $message) {
        parent::__construct(Confirmation::type);
        $this->id = $id;
        $this->message = $message;
    }

    public function getArray() {
        return array("Confirmation" => array(
                Keys::keyType => Confirmation::type,
                self::entityId => $this->id,
                self::keyMessage => $this->message
            )
        );
    }

}

?>
