// <editor-fold defaultstate="collapsed" desc="Loading Code">

$(document).ready(function() {

    $("#loading").show();
    setTimeout(function() {
        //$("#loading").hide();
        $("#loading").animate({
            "opacity": "0"
        }, 1000, function() {
            $("#loading").css("display", "none");
        });
    }, 1000);

    $(function() {
        maxZoom = 1.5;
        minZoom = 0.1;
        initApplication();
    });
});
// </editor-fold>

// var connection = new Database('tfsdev.visi3d.com', 'st_configread', 'passwordconfigread', 'shoreware');

// <editor-fold defaultstate="collapsed" desc="Constants">
var VCPStyles = new (function() {
    this.trunkStyle = new VCPStyle('#96AFCF', 'black', 3);
    this.personStyle = new VCPStyle('#C05046', 'black', 3);
    this.menuStyle = new VCPStyle('#4BACC6', 'black', 3);
    this.menuElementStyle = new VCPStyle('#D5DFEC', 'black', 1);
    this.huntGroupStyle = new VCPStyle('#9DBB61', 'black', 3);
    this.huntGroupElementStyle = new VCPStyle('#D5DFEC', 'black', 1);
    this.workGroupStyle = new VCPStyle('#AB9AC0', 'black', 3);
    this.workGroupElementStyle = new VCPStyle('#D5DFEC', 'black', 1);
    this.routePointStyle = new VCPStyle('#DEA17B', 'black', 3);
    this.routePointElementStyle = new VCPStyle('#D5DFEC', 'black', 1);
});
var hitOptions = {
    fill: true,
    tolerance: 5
};

var colors = ['#000000', '#00008B', '#006400', '#FF8C00', '#8B008B', '#8B0000'];

// <editor-fold defaultstate="collapsed" desc="Enums">
var DNType = {
    "None": 0,
    "UserExtension": 1,
    "AutoAttendant": 2,
    "BackupAutoAttendant": 3,
    "VoiceMailExtension": 4,
    "VoiceMailLoginExtension": 5,
    "Nightbell": 6,
    "Paging": 7,
    "Menu": 8,
    "Workgroup": 9,
    "Broadcast": 10,
    "DistributionList": 11,
    "RoutePoint": 13,
    "AmisTestMailbox": 14,
    "LocalAutoAttendant": 15,
    "LocalVoiceMailExtension": 16,
    "LocalVoiceMailLoginExtension": 17,
    "AccountCodeExtension": 18,
    "SystemConferenceExtension": 19,
    "SystemUserDN": 20,
    "PagingGroup": 21,
    "HuntGroup": 22,
    "SMDIVoiceMail": 23,
    "BridgedCallAppearance": 24,
    "GroupPickup": 25
};

var HunterPatternType = {
    "Top Down": 1,
    "Round Robin": 2,
    "Longest Idle": 3,
    "Simultaneous": 4
};

var OpCode = {
    "DialByLastName": 1,
    "RepeatPrompt": 2,
    "GoToMenu": 5,
    "LoginToMailbox": 6,
    "TransferToExtension": 7,
    "TakeMessage": 9,
    "HangUp": 11,
    "TakMessageByLastName": 12,
    "TakeMessageByFirstName": 13,
    "DialByFirstName": 14,
    "GoToExtension": 15
};

var CallFowardStatusType = {
    "Always": 1,
    "NoAnswerBusy": 2,
    "Never": 3
};

var TrunkType = {
    "None": 0,
    "AnalogLoopStart": 1,
    "AnalogDID": 2,
    "DigitalLoopStart": 3,
    "DigitalWinkStart": 4,
    "PRI": 5,
    "SIP": 6,
    "BRI": 7
};
// </editor-fold>
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Global Variables">

var colorCounter = 0;
project.vcpScript = this;
var viewWindow = project._scope.view;
var zoom = 1;
var sEntity;
var lastSelected;
var listener = new CanvasInterface();
var listtrunks = new Array();
var connection;
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Diagramming Methods">
var root;
var elements = [];
var graphicEntities = [];
var layers = new Array();
var layersChildren = new Array();
var layersParents = new Array();
var margin = new Size(60, 20);
var maxZoom; // variables declared at the jquery ready section
var minZoom; // variables declared at the jquery ready section
var maxItemSize = new Size(0, 0);
var maxSpace;
var maxLevelItemCount = 0;
//var unreferenced = new Array();

function resetDiagram() {
    for (var i in graphicEntities) {
        graphicEntities[i].destroy();
    }
    elements = [];
    graphicEntities = [];
    layers = new Array();
    layersChildren = new Array();
    layersParents = new Array();
    checkData = new Array();
    maxItemSize = new Size(0, 0);
    setZoom(1.0);
    project._scope.view.center = new Point(0, 0);
}

function diagram(entities) {
    resetDiagram();
    // Define the roots of the diagram
    var roots = new Array();
    for (var k = 0; k < entities.length; k++) {
        roots.push(getVCPObject(entities[k]));
    }
    root = elements[dn];
    var p = new Point(0, 0);
    addElement(root, p);
    var arr = new Array();
    arr.push(root);
    graphicEntitiesByChild(arr);
    graphicEntitiesByParent(arr);
    maxLevelItemCount = 0;
    for (var i = layersParents.length - 1; i >= 0; i--) {
        layers.push(layersParents[i]);
        maxLevelItemCount = Math.max(maxLevelItemCount, layersParents[i].length);
    }
    layers.push([graphicEntities[dn]]);
    for (var i = 0; i < layersChildren.length; i++) {
        layers.push(layersChildren[i]);
        maxLevelItemCount = Math.max(maxLevelItemCount, layersChildren[i].length);
    }
    maxSpace = new Size(
            (maxItemSize.width + margin.width) * layers.length,
            (maxItemSize.height + margin.height) * maxLevelItemCount
            );
//    console.log("maxItemSize: " + maxItemSize);
//    console.log("Max Space: " + maxSpace);
//    console.log("Max Level Item Count: " + maxLevelItemCount);
    drawDiagram();
    zoomAll();
    console.log(project.activeLayer);
}

function drawDiagram() {
    var sumX = 0;
    var dispX = maxSpace.width / layers.length;
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var dispY = (maxSpace.height / 2 / (layer.length + 1));
        var sumY = 0;
        for (var j = 0; j < layer.length; j++) {
            var graphicEntity = layer[j];
            sumY += dispY;
            var p = new Point(
                    sumX,
                    sumY
                    );
            graphicEntity.setPosition(p);
        }
        sumX = sumX + dispX;
    }
}


var checkData = new Array();
function graphicEntitiesByChild(elements) {
    var layer = new Array(); // graphic children
    var childrenElements = new Array(); // Layer of the data children
    // Goes through all of the elements children to add the graphic element
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element instanceof UserExtension) {
            // Since it doesnt have children it skips it
            continue;
        }
        var gElement = graphicEntities[element.dn]; // Gets the graphic entity of the element
        //var childArray = element.getChildren(); // the data children
        var childArray = new Array();

        var originalChildren = element.getChildren();
        console.log(element);
        console.log(originalChildren);
        // Checks so that no element is calling back his parent as a child
        if (element.parents != null) {
            for (var j = 0; j < originalChildren.length; j++) {
                var c = originalChildren[j];
                var loops = false;
                    
                for (var k = 0; k < element.parents.length; k++) {
                    if (element.parents[k].dn == c.dn) {
                        loops = true;
                        break;
                    }
                }
                if (!loops) {
                    childArray.push(c);
                }
            }
        } else {
            childArray = element.getChildren();
        }
        if (checkData[element.dn] == null) {
            // !!! IMPORTANT Check if the children already exists so it doesnt create an infinite loop.
            childrenElements = childrenElements.concat(childArray);
            checkData[element.dn] = element;
        }

        for (var j = 0; j < childArray.length; j++) {
            var child = childArray[j];
            var graphicChild;

            if (graphicEntities[child.dn] instanceof GraphicEntity) {
                //Child exists thus you need to move it
                graphicChild = graphicEntities[child.dn];
            } else {
                //Child doesnt exist
                graphicChild = addElement(child, new Point(0, 0));
            }

            layer.push(graphicChild);
            maxItemSize.width = Math.max(maxItemSize.width, graphicChild.base.bounds.width);
            maxItemSize.height = Math.max(maxItemSize.height, graphicChild.base.bounds.height);
            console.log(child);
            if (element instanceof Menu) {
                gElement.addComponentChild(child.dn, graphicChild);
            } else if (element instanceof HuntGroup) {
                gElement.addComponentChild(child.dn, graphicChild);
            } else if (element instanceof Workgroup) {
                gElement.addComponentChild(child.dn, graphicChild);
            } else if (element instanceof RoutePoint) {
                gElement.addComponentChild(child.dn, graphicChild);
            } else {
                gElement.addChildConnector(graphicChild);
            }
        }
    }
    if (layer.length > 0 && childrenElements.length > 0) {
        layersChildren.push(layer);
        graphicEntitiesByChild(childrenElements);
    }
}

function graphicEntitiesByParent(elements) {
    var layer = new Array();
    var parentElements = new Array();
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element instanceof Trunk) {
            continue;
        }
        var gElement = graphicEntities[element.dn];
        var parentArray = element.parents;
        parentElements = parentElements.concat(parentArray);
        for (var j = 0; j < parentArray.length; j++) {
            var parent = parentArray[j];
            var graphicParent;
            if (graphicEntities[parent.dn] instanceof GraphicEntity) {
                //Child exists thus you need to move it
                graphicParent = graphicEntities[parent.dn];
            } else {
                //Child doesnt exist
                graphicParent = addElement(parent, new Point(0, 0));
            }
            layer.push(graphicParent);
            maxItemSize.width = Math.max(maxItemSize.width, graphicParent.base.bounds.width);
            maxItemSize.height = Math.max(maxItemSize.height, graphicParent.base.bounds.height);
            if (!(parent instanceof Menu
                    || parent instanceof HuntGroup
                    || parent instanceof RoutePoint
                    || parent instanceof Workgroup)) {
                graphicParent.addChild(gElement);
            }
        }
    }
    if (layer.length > 0 && parentElements.length > 0) {
        layersParents.push(layer);
        graphicEntitiesByParent(parentElements);
    }
}

// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Factory">

function getVCPObject(obj) {
    if (elements[obj.dn] != null) {
        return elements[Obj.dn];
    }
    if (obj.hasOwnProperty('Trunk')) {
        return getTrunkFromObj(obj.Trunk);
    } else if (obj.hasOwnProperty('Menu')) {
        return getMenuFromObj(obj.Menu);
    } else if (obj.hasOwnProperty('HuntGroup')) {
        return getHuntGroupFromObj(obj.HuntGroup);
    } else if (obj.hasOwnProperty('Workgroup')) {
        return getWorkgroupFromObj(obj.Workgroup);
    } else if (obj.hasOwnProperty('RoutePoint')) {
        return getRoutePointFromObj(obj.RoutePoint);
    } else if (obj.hasOwnProperty('UserExtension')) {
        return getUserExtensionFromObj(obj.UserExtension);
    } else {
        if (typeof obj != 'object') {
            return elements[obj];
        }
        return null;
    }
}

function getTrunkFromObj(Obj) {
    var trunk;
    if (elements[Obj.dn] != null) {
        trunk = elements[Obj.dn];
    } else {
        trunk = new Trunk(
                Obj.dn,
                Obj.name,
                Obj.trunkType,
                Obj.destinationDn,
                Obj.menuDn,
                Obj.areaCode
                );
        elements[Obj.dn] = trunk;
    }
    for (var i = 0; i < Obj.children.length; i++) {
        var child = getVCPObject(Obj.children[i]);
        if (child != null) {
            trunk.addChild(child);
            child.addParent(trunk);
        } else {
//            unreferenced.push([trunk,Obj.children[i]]);
        }
    }
    return trunk;
}

function getMenuFromObj(Obj) {
    var menu;
    if (elements[Obj.dn] != null) {
        menu = elements[Obj.dn];
    } else {
        menu = new Menu(
                Obj.dn,
                Obj.description,
                Obj.prompt,
                Obj.filename
                );
        elements[Obj.dn] = menu;
    }
    for (var i = 0; i < Obj.children.length; i++) {
        var child = Obj.children[i];
        var menuItem;
        if (typeof child !== 'object') {
            menuItem = elements[child];
        } else {
            if (elements[Obj.dn + "-" + child.keypadid] != null) {
                menuItem = elements[Obj.dn + "-" + child.keypadid];
            } else {
                child = child.MenuItem;
                menuItem = new MenuOption(
                        menu,
                        child.keypadid,
                        child.opcode,
                        child.dn2,
                        child.extensionlistid
                        );
                elements[Obj.dn + "-" + child.keypadid] = menuItem;
            }
        }
        if (menuItem != null && typeof child == 'object') {
            menu.addChild(menuItem);
            for (var j = 0; j < child.children.length; j++) {
                var itemChild = getVCPObject(child.children[j]);
                if (itemChild != null) {
                    menuItem.addChild(itemChild);
                    itemChild.addParent(menu);
                } else {
//                    unreferenced.push([menuItem,child.children[j]]);
                }
            }
        } else {
//            unreferenced.push([menu,child])
        }
    }
    return menu;
}

function getHuntGroupFromObj(Obj) {
    var huntGroup;
    if (elements[Obj.dn] != null) {
        huntGroup = elements[Obj.dn];
    } else {
        huntGroup = new HuntGroup(
                Obj.dn,
                Obj.description,
                Obj.ringsPerMember,
                Obj.huntpatternid,
                Obj.backupdn,
                Obj.cfbusy,
                Obj.cfnoanswer
                );
        elements[Obj.dn] = huntGroup;
        for (var i = 0; i < Obj.children.length; i++) {
            var child = getVCPObject(Obj.children[i]);
            var component = new HuntGroupComponent(huntGroup, child.dn);
            component.addChild(child);
            huntGroup.addChild(component);
            child.addParent(huntGroup);
        }
    }
    return huntGroup;
}

function getWorkgroupFromObj(Obj) {
    var workgroup;
    if (elements[Obj.dn] != null) {
        workgroup = elements[Obj.dn];
    } else {
        workgroup = new Workgroup(
                Obj.dn,
                Obj.description,
                Obj.huntpatternid,
                Obj.backupdn,
                Obj.cfbusy,
                Obj.cfnoanswer,
                Obj.cfalways,
                Obj.cfdnnologgedinagent,
                Obj.cfnarings,
                Obj.cfhuntnarings,
                Obj.usergroupid,
                Obj.cfconditionid
                );
        elements[Obj.dn] = workgroup;
    }
    for (var i = 0; i < Obj.children.length; i++) {
        var child = getVCPObject(Obj.children[i]);
        if (child != null) {
            workgroup.addChild(child);
            child.addParent(workgroup);
        } else {
//            unreferenced.push([workgroup,Obj.children[i]]);
        }
    }
    return workgroup;
}

function getRoutePointFromObj(Obj) {
    var routePoint;
    if (elements[Obj.dn] != null) {
        routePoint = elements[Obj.dn];
    } else {
        routePoint = new RoutePoint(
                Obj.dn,
                Obj.description,
                Obj.huntpatternid,
                Obj.backupdn,
                Obj.cfbusy,
                Obj.cfnoanswer,
                Obj.cfalways,
                Obj.cfdnnologgedinagent,
                Obj.cfnarings,
                Obj.cfhuntnarings,
                Obj.usergroupid,
                Obj.cfconditionid
                );
        elements[Obj.dn] = routePoint;
    }
    for (var i = 0; i < Obj.children.length; i++) {
        var child = getVCPObject(Obj.children[i]);
        if (child != null) {
            routePoint.addChild(child);
            child.addParent(routePoint);
        } else {
//            unreferenced.push([routePoint,Obj.children[i]]);
        }
    }
    return routePoint;
}

function getUserExtensionFromObj(Obj) {
    var userExtension;
    if (elements[Obj.dn] != null) {
        userExtension = elements[Obj.dn];
    } else {
        userExtension = new UserExtension(
                Obj.dn,
                Obj.description,
                Obj.did
                );
        elements[Obj.dn] = userExtension;
    }
    return userExtension;
}

// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Events">

function onMouseDown(event) {
    var hitResult = project.hitTest(event.point, hitOptions);
    if (hitResult) {
        var selected = hitResult.item;
        while (selected !== null && !(selected instanceof Group)) {
            if (selected.parent) {
                selected = selected.parent;
            } else {
                selected = null;
            }
        }

        paintDetails(selected.entity.element);

        if (selected && selected.hasOwnProperty('entity')) {
            sEntity = selected.entity;
            project.activeLayer.selected = false;
            sEntity.base.selected = true;
            lastSelected = sEntity;
            sEntity.base.strokeColor = 'red';
            project.activeLayer.appendTop(sEntity.group);
        }
        if (!project.listener) {
            project.listener = new CanvasInterface();
        }
//        if (selected.entity.hasOwnProperty('trunk')){
//            project.listener.setTrunk(selected.entity.trunk);
//        }else if (selected.entity.hasOwnProperty('menu')){
//            project.listener.setMenu(selected.entity.menu);
//        }else if (selected.entity.hasOwnProperty('person')){
//            project.listener.setPerson(selected.entity.person);
//        }

    } else {
        $('#can').css('cursor', 'move');
    }
}


function paintDetails(element) {
    var strDetails = '';
    var strChildrenTitle = '';
    var strChildren = '';
    var strParentTitle = '';
    var strParent = '';

    if (element instanceof Trunk) {
        console.log(element);
        strDetails += '<h2 id="typeNodeName">Trunk</h2>';
        strDetails += '<p class="classDetailsNode">Name: <span>' + element.name + '</span></p>';
        strDetails += '<p class="classDetailsNode">Destination DN: <span>' + element.destinationDN + '</span></p>';
        strDetails += '<p class="classDetailsNode">DN: <span>' + element.dn + '</span></p>';
        strDetails += '<p class="classDetailsNode">Area Code: <span>' + element.areaCode + '</span></p>';
        strDetails += '<p class="classDetailsNode">Trunk Type: <span>' + element.trunkType + '</span></p>';

        strChildrenTitle += '<div style="width: 60px;"><p>DN</p></div>';
        strChildrenTitle += '<div style="width: 60px;"><p>Hunt</p></div>';
        strChildrenTitle += '<div style="width: 60px;"><p>Rings</p></div>';
        strChildrenTitle += '<div style="width: 140px;"><p>Name</p></div>';

        for (var i = 0; i < element.children.length; i++) {
            var item = element.children[i];
            strChildren += '<div class="eachElementGrid">';
            strChildren += '<div style="width: 60px;">' + item.dn + '</div>';
            strChildren += '<div style="width: 60px;">' + item.huntpatternid + '</div>';
            strChildren += '<div style="width: 60px;">' + item.ringsPerMember + '</div>';
            strChildren += '<div style="width: 140px;">' + item.name + '</div>';
            strChildren += '</div>';
        }
        
        strParent = '---';

    } else if (element instanceof Menu) {
        console.log(element);
        strDetails += '<h2 id="typeNodeName">Menu</h2>';
        strDetails += '<p class="classDetailsNode">Name: <span>' + element.name + '</span></p>';
        strDetails += '<p class="classDetailsNode">DN: <span>' + element.dn + '</span></p>';
        strDetails += '<p class="classDetailsNode">DN Type: <span>' + element.dnType + '</span></p>';
        strDetails += '<p class="classDetailsNode">Prompt: <span>' + element.prompt + '</span></p>';
        strDetails += '<p class="classDetailsNode">File name: <span>' + element.filename + '</span></p>';

        strChildrenTitle += '<div style="width: 60px;"><p>DN</p></div>';
        strChildrenTitle += '<div style="width: 60px;"><p>Ext. list</p></div>';
        strChildrenTitle += '<div style="width: 60px;"><p>Keypadid</p></div>';
        strChildrenTitle += '<div style="width: 60px;"><p>Op. Code</p></div>';

        for (var i = 0; i < element.children.length; i++) {
            var item = element.children[i];
            strChildren += '<div class="eachElementGrid">';
            strChildren += '<div style="width: 60px;">' + item.dn + '</div>';
            strChildren += '<div style="width: 60px;">' + item.extensionlistid + '</div>';
            strChildren += '<div style="width: 60px;">' + item.keypadid + '</div>';
            strChildren += '<div style="width: 60px;">' + item.opcode + '</div>';
            strChildren += '</div>';
        }
        
        strParentTitle += '<div style="width: 60px;"><p>DN</p></div>';
        strParentTitle += '<div style="width: 60px;"><p>Dn Type</p></div>';
        strParentTitle += '<div style="width: 100px;"><p>FileName</p></div>';
        strParentTitle += '<div style="width: 100px;"><p>Name</p></div>';

        for (var i = 0; i < element.parents.length; i++) {
            var item = element.parents[i];
            strParent += '<div class="eachElementGrid">';
            strParent += '<div style="width: 60px;">' + item.dn + '</div>';
            strParent += '<div style="width: 60px;">' + item.dnType + '</div>';
            strParent += '<div style="width: 100px;">' + item.filename + '</div>';
            strParent += '<div style="width: 140px;">' + item.name + '</div>';
            strParent += '</div>';
        }

    } else if (element instanceof Workgroup) {
        console.log('work');
    } else if (element instanceof RoutePoint) {
        console.log('route point');
    } else if (element instanceof HuntGroup) {
        strDetails += '<h2 id="typeNodeName">HuntGroup</h2>';
        strDetails += '<p class="classDetailsNode">Name: <span>' + element.name + '</span></p>';
        strDetails += '<p class="classDetailsNode">Destination DN: <span>' + element.dn + '</span></p>';
        strDetails += '<p class="classDetailsNode">Rings per Member: <span>' + element.ringsPerMember + '</span></p>';
        strDetails += '<p class="classDetailsNode">Hunt Pattern Id: <span>' + element.huntpatternid + '</span></p>';

        strChildrenTitle += '<div style="width: 60px;"><p>DID</p></div>';
        strChildrenTitle += '<div style="width: 60px;"><p>DN</p></div>';
        strChildrenTitle += '<div style="width: 160px;"><p>Name</p></div>';

        for (var i = 0; i < element.children.length; i++) {
            var item = element.children[i].children[0];
            strChildren += '<div class="eachElementGrid">';
            strChildren += '<div style="width: 60px;">' + item.did + '</div>';
            strChildren += '<div style="width: 60px;">' + item.dn + '</div>';
            strChildren += '<div style="width: 140px;">' + item.name + '</div>';
            strChildren += '</div>';
        }
        
        strParentTitle += '<div style="width: 60px;"><p>DN</p></div>';
        strParentTitle += '<div style="width: 60px;"><p>Des. DN</p></div>';
        strParentTitle += '<div style="width: 60px;"><p>AreaCode</p></div>';
        strParentTitle += '<div style="width: 140px;"><p>Name</p></div>';

        for (var i = 0; i < element.parents.length; i++) {
            var item = element.parents[i];
            strParent += '<div class="eachElementGrid">';
            strParent += '<div style="width: 60px;">' + item.dn + '</div>';
            strParent += '<div style="width: 60px;">' + item.destinationDn + '</div>';
            strParent += '<div style="width: 60px;">' + item.areaCode + '</div>';
            strParent += '<div style="width: 140px;">' + item.name + '</div>';
            strParent += '</div>';
        }

    } else if (element instanceof UserExtension) {
        console.log(element);
        strDetails += '<h2 id="typeNodeName">User Extension</h2>';
        strDetails += '<p class="classDetailsNode">Name: <span>' + element.name + '</span></p>';
        strDetails += '<p class="classDetailsNode">DN: <span>' + element.dn + '</span></p>';
        strDetails += '<p class="classDetailsNode">DID: <span>' + element.did + '</span></p>';

//        strChildrenTitle += '<div style="width: 60px;"><p>DID</p></div>';
//        strChildrenTitle += '<div style="width: 60px;"><p>DN</p></div>';
//        strChildrenTitle += '<div style="width: 160px;"><p>Name</p></div>';
//        
//        for(var i = 0; i < element.children.length; i++){
//            var item = element.children[i].children[0];
//            strChildren += '<div class="eachElementGrid">';
//            strChildren += '<div style="width: 60px;">'+ item.did +'</div>';
//            strChildren += '<div style="width: 60px;">'+ item.dn +'</div>';
//            strChildren += '<div style="width: 140px;">'+ item.name +'</div>';
//            strChildren += '</div>';
//         }
        strChildren = '---';
        
        strParentTitle += '<div style="width: 70px;"><p>backupdn</p></div>';
        strParentTitle += '<div style="width: 70px;"><p>cfbusy</p></div>';
        strParentTitle += '<div style="width: 80px;"><p>cfnoanswer</p></div>';

        for (var i = 0; i < element.parents.length; i++) {
            var item = element.parents[i];
            strParent += '<div class="eachElementGrid">';
            strParent += '<div style="width: 70px;">' + item.backupdn + '</div>';
            strParent += '<div style="width: 70px;">' + item.cfbusy + '</div>';
            strParent += '<div style="width: 80px;">' + item.cfnoanswer + '</div>';
            strParent += '</div>';
        }

    } else {
        //
    }

    $('#listDetails').html(strDetails);
    $('#gridChildrenDetails .titleGrid').html(strChildrenTitle);
    $('#gridChildrenDetails .bodyGrid').html(strChildren);
    $('#gridParentsDetails .titleGrid').html(strParentTitle);
    $('#gridParentsDetails .bodyGrid').html(strParent);
    $('#componentNode').show();

}

function onMouseDrag(event) {
    if (sEntity) {
        sEntity.addPosition(event.delta);
    } else {
        view.scrollBy(-(event.delta * 3) / 4 * zoom);
    }
}

function onMouseUp(event) {
    if (sEntity) {
        sEntity.base.strokeColor = 'black';
        sEntity = null;
    }
    $('#can').css('cursor', 'default');
}

function onKeyDown(event) {
}
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Diagram Functions">

// <editor-fold defaultstate="collapsed" desc="Zoom functions">

function zoomIn(zoomValue) {
    project._scope.view.zoom = zoomValue;
}


function setZoom(z) {
    if (z < minZoom) {
        z = minZoom;
    }
    if (z > maxZoom){
        z = maxZoom - 0.4;
    }
    zoom = z;
    project._scope.view.zoom = zoom;
    setZoomGUI();
}

function zoomAll() {
    var center = getCenter(project.activeLayer.children);
    project._scope.view.center = center;
    var zoomx = project._scope.view.viewSize.width / maxSpace.width;
    var zoomy = project._scope.view.viewSize.height / maxSpace.height;
    var newZoom = Math.min(zoomx, zoomy) - 0.1;
    setZoom(newZoom);
    project._scope.view.center = center;
}

function setZoomGUI(){
    $("#slider-zoom").slider('value',zoom *100);
    $("#zoomValue p span").html(" " + $("#slider-zoom").slider("value") + "%");
}

function getCenter(children) {
    var top = Infinity;
    var bottom = 0;
    var left = Infinity;
    var right = 0;
    for (var i = 0; i < children.length; i++) {
        if (children[i].entity != null && children[i].entity.isVisible()) {
            top = Math.min(top, children[i].entity.base.bounds.top);
            left = Math.min(left, children[i].entity.base.bounds.left);
            bottom = Math.max(bottom, children[i].bounds.bottom);
            right = Math.max(right, children[i].bounds.right);
        }
    }
    var p = new Point(left, top);
//    point2 = new Point(right,bottom);
//    space = new Point(right-left,bottom-top);
    maxSpace = new Size(right - left, bottom - top);
    return new Rectangle(left, top, right - left, bottom - top).center;
}

// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Add Elements Methods">

function addElement(element, position) {
    if (graphicEntities[element.dn] instanceof GraphicEntity) {
        return graphicEntities[element.dn()];
    }
    //Adds an element in the position indicated
    if (element instanceof Trunk) {
        return addTrunk(position, element);
    } else if (element instanceof Menu) {
        return addMenu(position, element);
    } else if (element instanceof Workgroup) {
        return addWorkgroup(position, element);
    } else if (element instanceof RoutePoint) {
        return addRoutePoint(position, element);
    } else if (element instanceof HuntGroup) {
        return addHuntGroup(position, element);
    } else if (element instanceof UserExtension) {
        return addUserExtension(position, element);
    } else {
        return null;
    }
}

function addTrunk(position, trunk) {
    var group = new Group();
    var sz = new Size(200, 40);
    var cornerSize = new Size(20, 20);
    var base = new Path.RoundRectangle(new Rectangle(position, sz), cornerSize);
    base.style = VCPStyles.trunkStyle;
    group.addChild(base);
    var text = new PointText(position + sz / 2 + new Point(0, 4));
    text.characterStyle = {
        fontSize: 12
    };
    text.justification = 'center';
    text.content = trunk.name;
    group.addChild(text);

    var entity = new GraphicEntity(trunk, base, group);
    graphicEntities[trunk.dn] = entity;
    return entity;
}

function addUserExtension(position, userExtension) {
    var group = new Group();
    var sz = new Size(200, 40);
    var base = new Path.Rectangle(new Rectangle(position, sz));
    base.style = VCPStyles.personStyle;
    group.addChild(base);

    var text = new PointText(position + sz / 2 + new Point(0, 4));
    text.characterStyle = {
        fontSize: 12
    };
    text.justification = 'center';
    var textContent = (userExtension.dn + ' ' + userExtension.name + ':' + userExtension.did);
    if (textContent.length > 20) {
        textContent = textContent.substring(0, 20) + "...";
    }
    text.content = textContent;
    group.addChild(text);

    var entity = new GraphicEntity(userExtension, base, group);
    graphicEntities[userExtension.dn] = entity;
    return entity;
}

var workGroupNames = ['Alwasy', 'Busy', 'No Answer', 'No Agent'];

function addWorkGroup(position, workGroup) {
    var optHeight = 30;
    var width = 300;
    var group = new Group();
    var optionCount = 4;
    var size = new Size(width, 50 + optionCount * optHeight);
    var base = new Path.Rectangle(new Rectangle(position, size));
    base.style = VCPStyles.workGroupStyle;
    group.addChild(base);

    var text = addText(position + new Point(10, 20), 12, (workGroup.dn + ' ' + workGroup.name).substring(0, 45));
    group.addChild(text);

    var options = new Array();
    for (var i = 0; i < optionCount; i++) {
        var option = workGroup.children[i];
        var optSize = new Size(width - 20, optHeight);
        var optPos = new Point(position.x + 19, position.y + 49 + optHeight * i);
        var opt = new Path.Rectangle(optPos, optSize);
        opt.style = VCPStyles.workGroupElementStyle;
        group.addChild(opt);
        var textDetail = '';
        if (option != null) {
            textDetail = option.children[0].dn + " - " + option.children[0].name;
        }
        text = addText(
                optPos + new Point(20, 22),
                10,
                workGroupNames[i] + ": " + textDetail);
        group.addChild(text);
        var e = new GraphicEntity(option, opt, group);
        e.childNumber = i;
        e.childCount = optionCount;
        options.push(e);
    }
    var entity = new GraphicEntity(workGroup, base, group);
    graphicEntities[workGroup.dn] = entity;
    entity.components = options;
    return entity;
}

function addRoutePoint(position, routePoint) {
    var optHeight = 30;
    var width = 300;
    var group = new Group();
    var optionCount = 4;
    var size = new Size(width, 50 + optionCount * optHeight);
    var base = new Path.Rectangle(new Rectangle(position, size));
    base.style = VCPStyles.routePointStyle;
    group.addChild(base);

    var text = addText(position + new Point(10, 20), 12, (routePoint.dn + ' ' + routePoint.name).substring(0, 45));
    group.addChild(text);

    var options = new Array();
    for (var i = 0; i < optionCount; i++) {
        var option = routePoint.children[i];
        var optSize = new Size(width - 20, optHeight);
        var optPos = new Point(position.x + 19, position.y + 49 + optHeight * i);
        var opt = new Path.Rectangle(optPos, optSize);
        opt.style = VCPStyles.routePointElementStyle;
        group.addChild(opt);
        var textDetail = '';
        if (option != null) {
            textDetail = option.dn + " - " + option.name;
        }
        text = addText(
                optPos + new Point(20, 22),
                10,
                workGroupNames[i] + ": " + textDetail);
        group.addChild(text);
        var e = new GraphicEntity(option, opt, group);
        e.childNumber = i;
        e.childCount = optionCount;
        options.push(e);
    }
    var entity = new GraphicEntity(routePoint, base, group);
    graphicEntities[routePoint.dn] = entity;
    entity.components = options;
    return entity;
}

function addHuntGroup(position, huntGroup) {
    var optHeight = 30;
    var width = 300;
    var group = new Group();
    var optionCount = huntGroup.children.length;
    var size = new Size(width, 50 + optionCount * optHeight);
    var base = new Path.Rectangle(new Rectangle(position, size));
    base.style = VCPStyles.huntGroupStyle;
    group.addChild(base);

    var text = addText(position + new Point(10, 20), 12, (huntGroup.dn + ' ' + huntGroup.name).substring(0, 45));
    group.addChild(text);

    var options = new Array();
    for (var i = 0; i < optionCount; i++) {
        var option = huntGroup.children[i];
        var optSize = new Size(width - 20, optHeight);
        var optPos = new Point(position.x + 19, position.y + 49 + optHeight * i);
        var opt = new Path.Rectangle(optPos, optSize);
        opt.style = VCPStyles.huntGroupElementStyle;
        group.addChild(opt);
        text = addText(
                optPos + new Point(20, 22),
                10,
                option.children[0].dn + " - " + option.children[0].name);
        group.addChild(text);
        var e = new GraphicEntity(option, opt, group);
        e.childNumber = i;
        e.childCount = optionCount;
        options.push(e);
    }
    var entity = new GraphicEntity(huntGroup, base, group);
    graphicEntities[huntGroup.dn] = entity;
    entity.components = options;
    return entity;
}

function addMenu(position, menu) {
    var optHeight = 30;
    var width = 300;
    var group = new Group();
    var optionCount = menu.children.length;
    var size = new Size(width, 50 + optionCount * optHeight);
    var base = new Path.Rectangle(new Rectangle(position, size));
    base.style = VCPStyles.menuStyle;
    group.addChild(base);

    var text = addText(position + new Point(10, 20), 12, (menu.dn + ' ' + menu.name).substring(0, 45));
    group.addChild(text);
    if (menu.prompt != null) {
        text = addText(position + new Point(10, 36), 8, menu.prompt.substring(0, 50));
        group.addChild(text);
    }
    var options = new Array();
    for (var i = 0; i < optionCount; i++) {
        var option = menu.children[i];
        var optSize = new Size(width - 20, optHeight);
        var optPos = new Point(position.x + 19, position.y + 49 + optHeight * i);
        var opt = new Path.Rectangle(optPos, optSize);
        opt.style = VCPStyles.menuElementStyle;
        group.addChild(opt);
        text = addText(
                optPos + new Point(20, 22),
                10,
                option.keypadid + " : " + option.getName());
        group.addChild(text);
        var e = new GraphicEntity(option, opt, group);
        e.childNumber = i;
        e.childCount = optionCount;
        options.push(e);
    }
    var entity = new GraphicEntity(menu, base, group);
    graphicEntities[menu.dn] = entity;
    entity.components = options;
    return entity;
}

function addText(position, size, text) {
    var obj = new PointText(position);
    obj.characterStyle = {
        fontSize: size
    };
    obj.content = text;
    return obj;
}

// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Reusable Functions">

function addItem(array, item) {
    array.push(item);
}

function containsDn(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].dn == obj.dn) {
            return true;
        }
    }
    return false;
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] == obj) {
            return true;
        }
    }

    return false;
}

function removeItem(array, item) {
    var id = array.indexOf(item);
    if (id != -1) {
        array.splice(id, 1);
    }
}

function organizePath(path) {
    if (path.segments.length == 4) {
        var pos1 = path.firstSegment.point;
        var pos2 = path.lastSegment.point;
        var midPos = (pos1 + pos2) / 2;
        path.removeSegment(1);
        path.removeSegment(1);
        var y = 0;
        if (path.percentage != undefined) {
            y = path.percentage * ((pos2.x - pos1.x - 30)) / 2;
        }
        var newDisplace = midPos.x + y;
        path.insert(1, new Point(newDisplace, pos1.y));
        path.insert(2, new Point(newDisplace, pos2.y));
    }
}

function getColor() {
    var color = colors[colorCounter];
    colorCounter = ++colorCounter % colors.length;
    return color;
}
// </editor-fold>

// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Entities">

// Trunk Object
function Trunk(dn, name, trunkType, destinationDn, menuDn, areaCode) {
    this.dn = dn;
    this.name = name;
    this.trunkType = trunkType;
    this.destinationDn = destinationDn;
    this.menuDn = menuDn;
    this.areaCode = areaCode;
    this.dnisdid = [];
    this.children = [];
    this.addChild = function(child) {
        addItem(this.children, child);
    };
    this.getChildren = function() {
        return this.children;
    };
}

// Destination Object
function DN(name, ext) {
    this.name = name;
    this.ext = ext;
}

// Menu Object
function Menu(dn, name, prompt, filename) {
    this.dn = dn;
    this.dnType = DNType.Menu;
    this.name = name;
    this.prompt = prompt;
    this.filename = filename;
    this.children = [];
    this.parents = [];
    this.addChild = function(child) {
        addItem(this.children, child);
    };
    this.addParent = function(parent) {
        addItem(this.parents, parent);
    };
    this.getChildren = function() {
        var array = new Array();
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            array = array.concat(child.children);
        }
        return array;
    };
}

// MenuOption Object
function MenuOption(Menu, keypadid, opcode, dn2, extensionlistid) {
    this.Menu = Menu;
    this.keypadid = keypadid;
    this.opcode = opcode;
    this.dn = dn2;
    this.extensionlistid = extensionlistid;
    this.children = [];
    this.addChild = function(child) {
        addItem(this.children, child);
    };
    this.getChildren = function() {
        return this.children;
    };
    this.getName = function() {
        if (this.children.length > 0) {
            return this.children[0].dn + " - " + this.children[0].name;
        } else {
            return "N/A";
        }
    };
}

// HuntGroup Object
function HuntGroup(dn, name, ringsPerMember, huntpatternid, backupdn, cfbusy, cfnoanswer) {
    this.dn = dn;
    this.name = name;
    this.ringsPerMember = ringsPerMember;
    this.huntpatternid = huntpatternid;
    this.backupdn = backupdn;
    this.cfbusy = cfbusy;
    this.cfnoanswer = cfnoanswer;
    this.children = [];
    this.parents = [];
    this.addChild = function(child) {
        addItem(this.children, child);
    };
    this.addParent = function(parent) {
        addItem(this.parents, parent);
    };
    this.getChildren = function() {
        var array = new Array();
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            array = array.concat(child.children);
        }
        return array;
    };
}

function HuntGroupComponent(HuntGroup, id) {
    this.dn = id;
    this.HuntGroup = HuntGroup;
    this.children = [];
    this.addChild = function(child) {
        addItem(this.children, child);
    };
    this.getChildren = function() {
        return this.children;
    };
    this.getName = function() {
        if (this.children.length > 0) {
            return this.children[0].dn + " - " + this.children[0].name;
        } else {
            return "N/A";
        }
    };
}

// Workgroup Object
function Workgroup(dn, name, huntpatternid, backupdn, cfbusy, cfnoanswer,
        cfalways, cfdnnologgedinagent, cfnarings, cfhuntnarings, usergroupid, cfconditionid) {
    this.dn = dn;
    this.name = name;
    this.huntpatternid = huntpatternid;
    this.backupdn = backupdn;
    this.cfbusy = cfbusy;
    this.cfnoanswer = cfnoanswer;
    this.cfalways = cfalways;
    this.cfdnnologgedinagent = cfdnnologgedinagent;
    this.cfnarings = cfnarings;
    this.cfhuntnarings = cfhuntnarings;
    this.usergroupid = usergroupid;
    this.cfconditionid = cfconditionid;
    this.children = [];
    this.parents = [];
    this.addChild = function(child) {
        addItem(this.children, child);
    };
    this.addParent = function(parent) {
        addItem(this.parents, parent);
    };
    this.getChildren = function() {
        return this.children;
//        var array = new Array();
//        for (var i = 0; i < this.children.length; i++) {
//            var child = this.children[i];
//            array = array.concat(child.children);
//        }
//        return array;
    };
}

// RouterPoint Object
function RoutePoint(dn, name, huntpatternid, backupdn, cfbusy, cfnoanswer, cfalways,
        cfdnnologgedinagent, cfnarings, cfhuntnarings, usergroupid, cfconditionid) {
    this.dn = dn;
    this.name = name;
    this.huntpatternid = huntpatternid;
    this.backupdn = backupdn;
    this.cfbusy = cfbusy;
    this.cfnoanswer = cfnoanswer;
    this.cfalways = cfalways;
    this.cfdnnologgedinagent = cfdnnologgedinagent;
    this.cfnarings = cfnarings;
    this.cfhuntnarings = cfhuntnarings;
    this.usergroupid = usergroupid;
    this.cfconditionid = cfconditionid;
    this.children = [];
    this.parents = [];
    this.addChild = function(child) {
        addItem(this.children, child);
    };
    this.addParent = function(parent) {
        addItem(this.parents, parent);
    };
    this.getChildren = function() {
        return this.children;
//        var array = new Array();
//        for (var i = 0; i < this.children.length; i++) {
//            var child = this.children[i];
//            array = array.concat(child.children);
//        }
//        return array;
    };
}

// MenuOption Object
function UserExtension(dn, name, did) {
    this.dn = dn;
    this.name = name;
    this.did = did;
    this.parents = [];
    this.addParent = function(parent) {
        addItem(this.parents, parent);
    };
    this.getChildren = function() {
        return new Array();
    };
}
//database Object
function Database(url, username, password, name) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.name = name;
    this.json = function() {
        return {
            url: this.url,
            username: this.username,
            password: this.password,
            name: this.name
        };
    };
}
// </editor-fold>

var step = 0;
// <editor-fold defaultstate="collapsed" desc="Diagram Entities">
// Entity Object
function GraphicEntity(element, base, group) {
    this.element = element;
    this.base = base;
    this.group = group;
    this.group.entity = this;
    this.connectors = [];
    this.children = [];
    this.components = [];
    this.parent = undefined;
    this.childNumber = 0; // If its a component it indicated the position its at
    this.childCount = 0;
    this.destroy = function() {
        this.group.remove();
        for (var i in this.connectors) {
            this.connectors[i].destroy();
        }
    };

    // <editor-fold defaultstate="collapsed" desc="Child Management">
    this.addChildConnector = function(child) {
        if (!containsDn(child, this.children)) {
            var pos1 = this.base.bounds.rightCenter;
            var pos2 = child.base.bounds.leftCenter;
            var midPos = (pos1 + pos2) / 2;
            var conn = new Path();
            conn.strokeColor = getColor();
            conn.strokeWidth = 3;
            conn.strokeJoin = 'round';
            conn.add(pos1);
            var y = 0;
            if (this.childCount !== 0) {
                var x = this.childNumber / this.childCount;
                y = -Math.pow((2 * x - 1), 2);
                conn.percentage = y;
                y = y * ((pos2.x - pos1.x - 80)) / 2;
            }
            var newDisplace = midPos.x + y;

            conn.add(new Point(newDisplace, pos1.y));
            conn.add(new Point(newDisplace, pos2.y));
            conn.add(pos2);
            project.activeLayer.appendBottom(conn);
            //console.log(project.activeLayer.children);
            this.addConnector(new Connector('out', this.base, conn, child));
            child.addConnector(new Connector('in', child.base, conn, this));
            addItem(this.children, child);
            child.parent = this;
        }
    };

    this.addComponentChild = function(dn, child) {
        for (var i in this.components) {
            var component = this.components[i];
            if (component.element.dn == dn) {
                component.addChildConnector(child);
                break;
            }
        }
    };

    this.removeChild = function(child) {
        // Not implemented yet
        removeItem(this.children, child);
    };

    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="Connector Management">

    this.addConnector = function(child) {
        addItem(this.connectors, child);
    };

    this.removeConnector = function(child) {
        removeItem(this.connectors, child);
    };
    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="Position Management">

    this.addPosition = function(delta) {
        this.group.position += delta;
        for (var i = 0; i < this.connectors.length; i++) {
            if (this.connectors[i]) {
                if (this.connectors[i].direction == 'out') {
                    this.connectors[i].path.firstSegment.point += delta;
                } else {
                    this.connectors[i].path.lastSegment.point += delta;
                }
                organizePath(this.connectors[i].path);
            }
        }
        if (this.components.length > 0) {
            for (var i in this.components) {
                this.components[i].addPositionComponent(delta);
            }
        }
    };

    this.setPosition = function(position) {
        var delta = position - this.group.position;
        this.addPosition(delta);
    };

    this.addPositionComponent = function(delta) {
        for (var i = 0; i < this.connectors.length; i++) {
            if (this.connectors[i]) {
                if (this.connectors[i].direction == 'out') {
                    this.connectors[i].path.firstSegment.point += delta;
                } else {
                    this.connectors[i].path.lastSegment.point += delta;
                }
                organizePath(this.connectors[i].path);
            }
        }
    };
    // </editor-fold>

    // <editor-fold defaultstate="collapsed" desc="Visible Mangament">

    this.setVisible = function(visible) {
        base.visible = visible;
        var i;
        this.group.visible = visible;
        for (i = 0; i < this.connectors.length; i++) {
            this.connectors[i].setVisible(visible);
        }
    };

    this.isVisible = function() {
        return base.visible;
    };
    // </editor-fold>
}

// Connector Object
function Connector(direction, shape, path, connectedEntity) {
    this.direction = direction; // out, in
    this.shape = shape;
    this.path = path;
    this.connectedEntity = connectedEntity;
    this.setVisible = function(visible) {
        this.path.visible = visible;
    };
    this.destroy = function() {
        this.path.remove();
    };
}

//Style object
function VCPStyle(fillColor, strokeColor, strokeWidth) {
    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    this.strokeWidth = strokeWidth;
    this.strokeCap = 'round';
}
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="GUI Manager">
var dn;
function initApplication() {
    $("#tabs").tabs();
    $('.component').hide();
    $("#myCanvas").ready(function() {
        getProject();
    });

    $("#cbDataObjects").find('option[value=chooseobject]').attr('selected', 'selected');

    $("#cbDataObjects").change(function() {
        var indice = $(this).val();
        var result;
        var str;
        switch (indice) {
            case 'trunk':
                result = r_callService(false, "../ws/service/webservice.php", "getTrunks", "", "GET");
                str = '';
                for (var i = 0; i < result.length; i++) {
                    listtrunks[i] = result[i].Trunk;
                    str += '<option value="' + result[i].Trunk.dn + '">' + result[i].Trunk.name + '</option>';
                }
                break;
            case 'menu':
                result = r_callService(false, "../ws/service/webservice.php", "getMenus", "", "GET");
                str = '';
                for (var i = 0; i < result.length; i++) {
                    listtrunks[i] = result[i].Trunk;
                    str += '<option value="' + result[i].Trunk.dn + '">' + result[i].Trunk.name + '</option>';
                }
                break;
            default:
                break;
        }
        $('#listElements').html(str);
        dn = $('#listElements').val();
    });

    $('#listElements').change(function() {
        dn = $(this).val();
    });

    $("#diagramButton").click(function() {
        var service = '';
        switch ($("#cbDataObjects").val()) {
            case 'trunk':
                service = 'getTrunkByDn';
                break;
            case 'menu':
                service = 'getMenuByDn';
                break;
            case 'huntgroup':
                service = 'getHuntGroupByDn';
                break;
            case 'workgroup':
                service = 'getWorkgroupByDn';
                break;
            case 'routepoint':
                service = 'getRoutePointByDn';
                break;
            default:
                break;
        }
        result = r_callService(false, "../ws/service/webservice.php", service, "dn=" + dn + "&", "GET");
        diagram(result);
    });

    // <editor-fold defaultstate="collapsed" desc="Show/Hide Elements">

    $("#btnShowChildren").click(function() {
        setChildrenVisible(lastSelected, true);
    });

    $("#btnHideChildren").click(function() {
        setChildrenVisible(lastSelected, false);
    });

    $("#btnShowParents").click(function() {
        setParentsVisible(lastSelected, true);
    });

    $("#btnHideParents").click(function() {
        setParentsVisible(lastSelected, false);
    });
    // </editor-fold>

    $("#dialog").dialog({
        modal: true
    });

    // <editor-fold defaultstate="collapsed" desc="Zoom GUI">
    $("#zoomAll").click(function() {
        zoomAll();
    });

    $(function() {
        $("#slider-zoom").slider({
            range: "min",
            value: 100,
            min: parseInt(minZoom * 100),
            max: parseInt(maxZoom * 100),
            slide: function(event, ui) {
                $("#zoomValue p span").html(" " + ui.value + "%");
                var zoomDiagram = parseFloat(ui.value / 100);
                //$("#zoomValue p span").append(' = ' + zoomDiagram);
                setZoom(zoomDiagram);
            }
        });
        $("#zoomValue p span").html(" " + $("#slider-zoom").slider("value") + "%");
    });

    // </editor-fold>

    $("#connect").click(function() {
        connection = new Database(
                $("#url").val(),
                $("#userName").val(),
                $("#password").val(),
                $("#database").val());
        $.ajax({
            data: {
                command: 'connect',
                database: connection.json()
            },
            type: "GET",
            //            url: "http://www.blueprintcontrol.com/VCPws/webservice.php", 
            url: "../ws/service/webservice.php",
            success: function(data) {
                if (data == "Connection Established") {
                    connected = true;
                    $("#dialog").dialog("close");
                } else {
                    connected = false;
                    alert("Connection Error");
                }
            },
            error: function() {
                alert("Failed!!");
            }
        });
    });
}

function setChildrenVisible(entity, visible) {
    setChildrenVisibleRecursive(entity, visible);
    viewWindow.draw();
}

function setChildrenVisibleRecursive(entity, visible) {
    if (entity) {
        var i;
        for (i = 0; i < entity.children.length; i++) {
            entity.children[i].setVisible(visible);
            setChildrenVisibleRecursive(entity.children[i], visible);
        }
        for (i = 0; i < entity.components.length; i++) {
            setChildrenVisibleRecursive(entity.components[i], visible);
        }
    }
}

function setParentsVisible(entity, visible) {
    var i = 0;
    var children = project.activeLayer._children;
    var v = true;

    if (entity.children.length > 0) {
        v = entity.children[0].isVisible();
    }

    for (i = 0; i < children.length; i++) {
        children[i].setVisible(visible);
    }
    entity.setVisible(true);
    for (i = 0; i < entity.connectors.length; i++) {
        if (entity.connectors[i].direction == 'in') {
            entity.connectors[i].setVisible(visible);
        }
    }
    setChildrenVisible(entity, v);
    viewWindow.draw();
}

function getProject() {
    project.listener = listener;
}

function CanvasInterface() {
    this.showing = null;
    this.setTrunk = function(trunk) {
        this.showing = trunk;
        $('.component').hide();
        $('div#trunk').show();
        $('#trunkName').text(trunk.title);
        $('#trunkType').text("Type: " + getKeyByValue(TrunkType, trunk.trunkType));
        $('#destDn').text("Dest. Dn: " + trunk.destinationDn);
        $('#menuDn').text("Menu Dn: " + trunk.menuDn);
        createGridDetails();
    };
    this.setMenu = function(menu) {
        this.showing = menu;
        $('div.component').hide();
        $('div#menu').show();
        $('#menuName').text(menu.dn + " " + menu.name);
        $('#menuDialog').text(menu.dialog);
    };
    this.setPerson = function(person) {
        this.showing = person;
        $('div.component').hide();
        $('div#person').show();
        $('#personName').text(person.name);
        $('#ext').text(person.ext);
    };
}

function getKeyByValue(array, value) {
    for (var prop in array) {
        if (array[prop] === value)
            return prop;
    }
    return null;
}

function createGridDetails() {
}

// </editor-fold>
