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
        obstaclePrefab: cc.Prefab,
        scoreLabel: cc.Label,
        beastScoreLabel: cc.Label,

        menuNode: cc.Node,
        startBtn: cc.Button
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        this.initGame();
        this.initMenu();
    },

    onDestroy() {
        this.node.off('touchmove', this.onTouchMoveHandler, this);
        this.startBtn.node.off("touchend", this.startBtnHandler, this);
        this.node.off("GameOver", this.onListenGameOver, this);
    },

    update(dt) {
        this.updateGame(dt);
    },

    initGame() {

        window.beastScore = 0;

        this.scoreNum = 0;
        this.timer = 0;
        this.screenH = cc.winSize.height;
        this.screenW = cc.winSize.width;
        this.gameStatu = false;

        this.obstaclePool = new cc.NodePool();

        this.beastScoreLabel.string = "Beast Score: " + window.beastScore;
        this.scoreLabel.string = "score: " + this.scoreNum;

        this.node.on("touchmove", this.onTouchMoveHandler, this);
        this.node.on("GameOver", this.onListenGameOver, this);

        this.collisionManager = cc.director.getCollisionManager();
        this.collisionManager.enabled = true;
        this.collisionManager.enabledDebugDraw = true;
    },

    initMenu() {
        this.startBtn.node.on("touchend", this.onStartBtnHandler, this);
    },

    updateGame(dt) {

        if (!this.gameStatu) {
            return;
        }

        this.timer += dt;
        if (this.timer < 1) {
            return;
        }
        this.timer = 0;

        let createObstacleNumber = Math.floor(Math.random() * 3 + 1);
        for (let index = 0; index < createObstacleNumber; index++) {
            this.createObstacle();
        }
    },

    onStartBtnHandler() {

        this.menuNode.active = false;
        this.player.active = true;
        this.gameStatu = true;

        // this.scheduleOnce(() => {
        //     this.gameEnd();
        // }, 10);
    },

    onTouchMoveHandler(touch) {

        let vectorDelta = touch.getDelta();
        this.player.x += vectorDelta.x;
        this.player.y += vectorDelta.y;
    },

    onListenGameOver(event) {

        this.gameEnd();
        event.stopPropagation();
    },

    checkPoolSize() {
        console.log("当前对象池内对象数量： " + this.obstaclePool.size());
    },

    createObstacle() {

        this.checkPoolSize();
        var obstacleNode;
        if (this.obstaclePool.size() > 0) {
            obstacleNode = this.obstaclePool.get();
        } else {
            obstacleNode = cc.instantiate(this.obstaclePrefab);
        }

        obstacleNode.width = Math.floor(Math.random() * 100 + 100);

        let boxCollider = obstacleNode.getComponent(cc.BoxCollider);
        boxCollider.size.width = obstacleNode.width;
        boxCollider.size.height = obstacleNode.height;

        this.addToCanvase(obstacleNode);
        this.randPosition(obstacleNode);
        this.runAnimation(obstacleNode);
    },

    addToCanvase(targetNode) {
        this.node.addChild(targetNode);
    },

    randPosition(targetNode) {

        let randomX = Math.floor(Math.random() * this.screenW - (this.screenW / 2));
        targetNode.setPosition(cc.v2(randomX, this.screenH));
    },

    runAnimation(targetNode) {

        let handler = cc.callFunc(function (target) {

            targetNode.removeFromParent();
            this.obstaclePool.put(targetNode);

            this.scoreNum += 1;
            this.scoreLabel.string = "score:" + this.scoreNum;

            console.log("回收障碍物");
        }, this);

        let targetX = targetNode.x;
        let targetVector = cc.v2(targetX, -this.screenH);

        let targetAction = cc.sequence(cc.moveTo(1.5, targetVector), cc.callFunc((target) => {

            targetNode.removeFromParent();
            this.obstaclePool.put(targetNode);

            if (this.gameStatu) {

                this.scoreNum += 1;
                this.scoreLabel.string = "score:" + this.scoreNum;
            }

            console.log("回收障碍物");
        }));
        targetNode.runAction(targetAction);
    },

    gameEnd() {

        this.player.active = false;

        this.menuNode.active = true;
        this.gameStatu = false;

        if (this.scoreNum > window.beastScore) {
            window.beastScore = this.scoreNum;
        }
        this.beastScoreLabel.string = "Beast Score: " + window.beastScore;

        this.scoreNum = 0;
        this.scoreLabel.string = "score:" + this.scoreNum;
    }
});