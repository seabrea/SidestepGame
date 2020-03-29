// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

        player: cc.Node,
        stopTouchLayer: cc.Node,
        obstaclePrefab: cc.Prefab,
        scoreLabel: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        this.scoreNum = 0,
        this.timer = 0;
        this.obstaclePool = new cc.NodePool("checkPoolSize");

        this.scoreLabel.string = "score:" + this.scoreNum;

        this.node.on('touchmove', this.onTouchMoveHandler, this);
    },

    onDestroy() {
        this.node.off('touchmove', this.onTouchMoveHandler, this);
    },

    start () {

    },

    update (dt) {

        this.timer += dt;
        
        if (this.timer < 2) {
            return;
        }

        this.timer = 0;

        this.createObstacle();
    },

    onTouchMoveHandler(touch) {

        let vectorDelta = touch.getDelta();
        this.player.x += vectorDelta.x;
        this.player.y += vectorDelta.y;
    },

    checkPoolSize() {

        console.log("当前对象池内对象数量： " + this.obstaclePool.size());
    },

    createObstacle() {

        var obstacleNode;
        if (this.obstaclePool.size === 0) {
            obstacleNode = cc.instantiate(this.obstaclePrefab);
        }
        else {
            obstacleNode = this.obstaclePool.get();
        }

        this.node.addChild(obstacleNode);
        obstacleNode.setPosition(this.randPosition());
        this.runAnimation(obstacleNode);
    },

    randPosition() {
        
        return cc.v2(0, 0);
    },

    runAnimation(targetNode) {
        
        let nodeAction = cc.sequence(cc.moveTo(cc.v2(0,100)), cc.callFunc(()=>{

            targetNode.removeFromParent();
            this.obstaclePool.put(targetNode);

            this.scoreNum += 1;
            this.scoreLabel.string = "score:" + this.scoreNum;

            console.log("回收障碍物");
        }).bind(this));
        targetNode.runAction(nodeAction);
    },
});
