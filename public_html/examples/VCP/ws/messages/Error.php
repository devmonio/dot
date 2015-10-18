<?php

/**
 * Description of Error
 *
 * @author Rodrigo
 */
class Error extends Message {
    // Webservice Errors
    const EmptyParametersError = 0;
    const UndefinedIndexError = 1;
    const UnknownEntity = 2;
    const JSON = 3;
    const EmptyQuery = 301;

    static function sendError($category, $code, $message) {
        $error = new Error($category, $code, $message);
        echo json_encode($error->getArray());
        die;
    }
    // los indices del formato de mensaje error
    const type = "error";
    
    
    private $category;
    private $code;
    private $message;

    public function __construct($category, $code, $message) {
        parent::__construct(Error::type);
        $this->category = $category;
        $this->code = $code;
        $this->message = $message;
    }

    public function getArray() {
        return array("Error" => array(
            Keys::keyType => Error::type,
            Keys::keyCategory => $this->category,
            Keys::keyCode => $this->code,
            Keys::keyMessage => $this->message)
        );
    }

}

?>
