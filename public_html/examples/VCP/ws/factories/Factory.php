<?php

class Factory {

    static public function getTrunk($row) {
        return new Trunk(
                        $row->TrunkGroupId,
                        $row->TrunkGroupName,
                        $row->TrunkTypeId,
                        $row->AreaCode,
                        $row->DestinationDN,
                        $row->MenuDN
        );
    }

    static public function getMenu($row) {
        return new Menu(
                        $row->dn,
                        $row->description,
                        $row->prompttext,
                        $row->filename
        );
    }

    /**
     * 
     * @param Menu $parent
     * @param type $row
     * @return \MenuItem
     */
    static public function getMenuItem($parent, $row) {
        return new MenuItem(
                        $parent->getDn().'-'.$row->keypadid,
                        $row->keypadid,
                        $row->opcodeid,
                        $row->dn,
                        $row->extensionlistid
        );
    }
    
    static public function getUserExtension($row) {
        return new UserExtension(
                        $row->dn,
                        $row->description,
                        $row->did
        );
    }

    static public function getWorkGroup($row) {
        return new Workgroup(
                        $row->dn,
                        $row->Description,
                        $row->huntpatternid,
                        $row->backupdn,
                        $row->cfbusy,
                        $row->cfnoanswer,
                        $row->cfalways,
                        $row->cfdnnologgedinagent,
                        $row->cfnarings,
                        $row->cfhuntnarings,
                        $row->usergroupid,
                        $row->cfconditionid
        );
    }
    
    static public function getRoutePoint($row) {
        return new RoutePoint(
                        $row->dn,
                        $row->Description,
                        $row->huntpatternid,
                        $row->backupdn,
                        $row->cfbusy,
                        $row->cfnoanswer,
                        $row->cfalways,
                        $row->cfdnnologgedinagent,
                        $row->cfnarings,
                        $row->cfhuntnarings,
                        $row->usergroupid,
                        $row->cfconditionid
        );
    }

    static public function getHuntGroup($row) {
        return new HuntGroup(
                        $row->dn,
                        $row->description,
                        $row->RingsPerMember,
                        $row->huntpatternid,
                        $row->backupdn,
                        $row->cfbusy,
                        $row->cfnoanswer
        );
    }

}

?>