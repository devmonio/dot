<?php
/**
 * Description of Trunk
 *
 * @author RodrigoLaptop
 */
class RoutePoint extends Workgroup{
    
    public function __construct($dn, $description, $huntpatternid, $backupdn, $cfbusy, $cfnoanswer, $cfalways, 
            $cfdnnologgedinagent, $cfnarings, $cfhuntnarings, $usergroupid, $cfconditionid) {
        parent::__construct($dn, $description, $huntpatternid, $backupdn, $cfbusy, $cfnoanswer, 
                $cfalways, $cfdnnologgedinagent, $cfnarings, $cfhuntnarings, $usergroupid, $cfconditionid);
    }
    
    function getArray() {
        return array( 
            'RoutePoint' => array(
                'dn' => $this->getDn(),
                'description' => $this->getDescription(),
                'huntpatternid' => $this->getHuntpatternid(),
                'backupdn' => $this->getBackupdn(),
                'cfbusy' => $this->getCfbusy(),
                'cfnoanswer' => $this->getCfnoanswer(),
                'cfalways' => $this->getCfalways(),
                'cfdnnologgedinagent' => $this->getCfdnnologgedinagent(),
                'cfnarings' => $this->getCfnarings(),
                'cfhuntnarings' => $this->getCfhuntnarings(),
                'usergroupid' => $this->getUsergroupid(),
                'cfconditionid' => $this->getCfconditionid(),
                'children' => ArrayHelper::getArray($this->getChildren())
            ));
    }
}

?>
