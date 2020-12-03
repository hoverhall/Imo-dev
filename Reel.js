import {app} from 'core/app';
import Reel from 'core/components/Reel';
import GameSymbol from 'core/components/GameSymbol';
import Sound from 'core/core/Sound';
import {utils} from 'core/utils';

Object.assign(Reel.prototype, {
    // spin the reel
    push(symbolId, row = -1, state = null){
        ++this.reeelIdx;

        let lastSymbol = this.symbols.pop();
        for(let i = 0; i < this.symbols.length; ++i){
            this.symbols[i].y += (app.config.get('GameSymbol.height') + app.config.get('Reels.gapV'));
        }
        lastSymbol.y = -app.config.get('GameSymbol.height') / 2 - app.config.get('Reels.gapV');
        this.symbols.unshift(lastSymbol);

        lastSymbol.row = row;
        lastSymbol.reelIdx = this.reeelIdx;
        this.zsort();

        // symbolID should have only real symbols going on board.

        if(symbolId){

            lastSymbol.id = symbolId;
           lastSymbol.setStaticState();
            lastSymbol.onBoardingSymbol(this);
            state = state || GameSymbol.STATIC;
        }else{
            // allow programm reel with 2-3-4 step by step symbol at loop.
            if (!this.loopQueue || !this.loopQueue.length){

                S:
                while(true){
                    let res = GameSymbol.getRandomArr(this.id - 1);

                    if(app.model.get('game.current') == 'freespins') {
                        // console.log("step"+1)
                        if(res == 1) {
                            // console.log("step"+2)
                            res = 12 + Math.round(Math.random(0, 3));
                        }
                        if([14, 18, 19].indexOf(res) != -1) {
                            // console.log("step"+4)
                            res = 1;
                        }
                    } else {
                        // console.log("step"+3)
                        if([14, 18, 19].indexOf(res) != -1) {
                            // console.log("step"+4)
                            res = 1;
                        }
                    }

                    for (let i = 0; i < this.symbols.length; i++){
                        if (this.symbols[i].id === res[0])
                            continue S;
                    }
                    // console.log(res)
                    this.loopQueue = res;
                    // console.log("step"+6)
                    break;
                }
            }
            state = state || GameSymbol.MOVE;
            lastSymbol.row = -1;
        }

        lastSymbol.setId(symbolId);
        lastSymbol.setState(state);

        this.emit(Reel.EVENT.PUSH);
    },

    blinking(row) {
        return new Promise(resolve => {
            const target = this.getSymbol(row);

            target.alpha = 0

            createjs.Tween.get(target, {
                    override: true,
                    loop: 5,
                    onComplete: ()=>{
                        target.alpha = 0;
                        target.y = this.symbols[0].y;
                        target.row = -1;
                        resolve();
                    }
            })
            .wait(50)
            .to({alpha: 0})
            // .call(()=>Sound.play('delete_symbol'))
            // .wait(50)
            // .to({alpha: 1})
        });
    },

    /**
    * fucking hard, may be need to refactor
    */
    calculateRows() {
        return new Promise((resolve) => {
            const deleted = [];
            const last = [];
            for(let i = 1; i < this.symbols.length-1; i++) { // indexes 1-3
                if(this.symbols[i].alpha == 0 && this.symbols[i].row == -1) {
                    deleted.push(i);
                } else {
                    last.push(i);
                }
            }

            deleted.sort((a, b) => { return b-a });
            last.sort((a, b) => { return b-a });

            const moveArr = [];
            const endPoint = Math.max(...deleted);
            switch(last.length) {
                case 1:
                    if(endPoint > last[0] && last[0] < 3) {
                        moveArr.push({symbol: this.symbols[last[0]], steps: endPoint-last[0]});
                        this.symbols[last[0]].row += endPoint-last[0];
                    }
                    break;
                case 2:
                    last.forEach((item, i)=>{
                        if(endPoint > item && item < 3) {
                            if(Math.abs(last[0]-last[1]) > 1) {
                                moveArr.push({ symbol: this.symbols[item], steps: endPoint-item }); // 1, 3
                                this.symbols[item].row += endPoint-item;
                            } else {
                                moveArr.push({ symbol: this.symbols[item], steps: endPoint-item-i }); // 1, 2
                                this.symbols[item].row += endPoint-item-i;
                            }
                        }
                    });
                    break;
            }

            deleted.forEach((item, i)=>{
                moveArr.push({ symbol: this.symbols[item], steps: deleted.length-i });
                this.symbols[item].row += deleted.length-i;
            });

            const first = this.symbols.shift();
            const las = this.symbols.pop();
            this.symbols.sort((symbolA, symbolB)=>{
                return symbolA.row-symbolB.row;
            });
            this.symbols.unshift(first);
            this.symbols.push(las);

            resolve(moveArr);
        });
    },

    shifting(moveArr) {
        const upped = moveArr.filter((item)=>{
            return item.symbol.y == -app.config.get('GameSymbol.height')/2;
        })

        upped.forEach((item, i)=>{ // correct start Y for animation, need the array sorted by steps desc
            if(item.symbol.y == -app.config.get('GameSymbol.height')/2)
                item.symbol.y -= i*166;
        })

        this.zsort();

        return new Promise((end) => {
            const promises = () => {
                const promises = [];

                moveArr.forEach((item, i)=>{
                    promises.push(this.shiftSymbol(item.symbol))
                });
                return promises;
            }

            Promise.all( promises() )
                // .then(() => this.shiftMask() )
                .then(() => end());
        });
    },

    shiftSymbol(symbol) {
        return new Promise((resolve)=>{
            const reels_cell_height = app.config.get('GameSymbol.height') + app.config.get('Reels.gapV');
            const end_y = reels_cell_height/2 + reels_cell_height * symbol.row; // 83, 249, 415
            const step = 16;

            symbol.alpha = 1;
            symbol.visible = true
            symbol.update = ()=>{
                if(symbol.y >= end_y-10) {
                    symbol.update = ()=>{}
                    symbol.y = end_y;

                    utils.wait(100).then(()=>resolve());
                } else {
                    symbol.y += step + (step * 0.3);
                }
            }

        });
    },

    zsort() {
        this.reel.removeChildren();
        for(let i=0; i < this.symbols.length-1; i++) {
            this.reel.addChildAt(this.symbols[i], i);
        }

        for(let i=0; i < this.symbols.length-1; i++) {
            if(this.symbols[i].id == GameSymbol.SCATTER_ID) this.reel.addChild(this.symbols[i]);
        }
    },

    shiftMask() {
        app.board.idleContainer.addChild(this);
        this.reelMask.y -= 25;
        this.reelMask.height += 25;
    }
 });
