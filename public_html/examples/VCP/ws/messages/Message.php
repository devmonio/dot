<?php

/**
 * Description of Message
 *
 * @author Rodrigo
 */
abstract class Message {

    // <editor-fold defaultstate="collapsed" desc="Categories">
    const WebserviceC = "webservice";
    const DatabaseC = "database";
    const LogicC = "logic";
    const UnknownC = "unknown";
    // </editor-fold>

    private $type;

    public function __construct($type) {
        $this->type = $type;
    }

    abstract public function getArray();
}

final class Keys {
    const keyType = "type";
    const keyCategory = "category";
    const keyCode = "code";
    const keyMessage = "message";

    private function __construct() {
    }
}

?>
