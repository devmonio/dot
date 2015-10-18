<?php
/**
 * Description of ArrayHelper
 * @author Rodrigo
 */

class ArrayHelper {
    
    public static function getArray($arrayConvertible) {
        if (!$arrayConvertible)
            return array();
        $jsonArray = array();
        foreach ($arrayConvertible as &$object){
            if ($object instanceof Element){
                array_push($jsonArray, $object->getArray());
            }else{
                array_push($jsonArray, $object);
            }
        }
        return $jsonArray;
    }
    
    public static function getArrayObject($object) {
        if ($object) {
            if (method_exists($object, 'getArray')) {
                return $object->getArray();
            } else {
                return array("NULL" => "NULL");
            }
        } else {
            return array("NULL" => "NULL");
        }
    }

}

?>
