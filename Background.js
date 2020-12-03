import {app, env, spriteMgr} from 'core/app';

import Background from 'core/components/Background';
import {Draw} from 'slotscore/core/components/Draw';

const modes = ['spins', 'freespins', 'bonus', 'mini_bonus'];


const animations = {};
Object.assign(Background.prototype, {
    onInit(){
        if(!this.inited){
            this.inited = true;
            this.mode = null;
            this.oldArmature = null;
            this.oldFg = null

            this.portrait = false;

            app.lr('bg').addChild(this);
            app.ticker.add(this.update, this);

            this.container = this.addChild(new PIXI.Container());
            this.container.position.set(0, 0);
        }
        let mode = 0
        switch (app.model.get('game.freespins.mode')) {
            case "":
                mode = 0
                break;
            case "mode10":
                mode = 1
                break;
            case "mode15":
                mode = 2
                break;
            case "mode20":
                mode = 3
                break;
            case "mode25":
                mode = 4
                break;
        }
        this.use(app.model.get('game.current'), false, 1000, mode);

    },

    bgEvents(e){

    },

    use(mode=null, animated = true, time = 1000, fs_mode = 0){
        if(this.mode === mode){
            return Promise.resolve();
        }

        if (mode != null) {
            this.fs_mode = fs_mode
            this.mode = mode;
        }

        // if(modes.indexOf(mode) === -1){
        //     mode = 'spins';
        // }

        //const bg = this.container.addChild(Draw.buildSptrite(mode === 'freespins' ? 'bg_free' : 'bg_main'));
        // console.log(app.model.data['game.actions'].includes('freespin_init'))
        let foreground;
        if (fs_mode) {
            this.bg = this.container.addChild(Draw.buildSpine('background', true, mode == 'spins' ? 'spins' : `freespins${fs_mode}`));
            foreground = this.container.addChild(Draw.buildSpine('foreground', true, mode == 'spins' ? 'spins' : `freespins${fs_mode}`));
        } else {
            this.bg = this.container.addChild(Draw.buildSpine('background', true, 'spins'));
            foreground = this.container.addChild(Draw.buildSpine('foreground', true, 'spins'));   
        }
        this.foreground = foreground
        //this.logo.position.set(135, 320);
        this.bg.alpha = 0;
        foreground.alpha = 0;

        if(!this.oldArmature){
            this.bg.alpha = 1;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
            foreground.alpha = 1;
            this.oldArmature = this.bg;
            this.oldFg = this.foreground
        }
        else{
            return new Promise(res =>{
                let oldArmature = this.oldArmature;
                let oldFg = this.oldFg

                createjs.Tween.get(oldArmature)
                    .to({alpha: 0}, time)
                    .call(() =>{
                        oldArmature.removeFromParent();
                        oldFg.removeFromParent()
                    })
                    .call(() => res());

                createjs.Tween.get(this.bg)
                    .to({alpha: 1}, time)
                    .call(() =>{
                        this.oldArmature = this.bg;
                    });
                createjs.Tween.get(foreground)
                    .to({alpha: 1}, time)
                    .call(() =>{
                        this.oldFg = foreground;
                        this.clearBgChildren()
                    });
            });            
        }        

        return Promise.resolve();
    },

    useSpecialBackground() {
        let time = 1000
        // console.log('### Background => useSpecialBackground ')
        // if(modes.indexOf(mode) === -1){
        //     mode = 'spins';
        // }

        //const bg = this.container.addChild(Draw.buildSptrite(mode === 'freespins' ? 'bg_free' : 'bg_main'));
        let foreground;

        this.bg = this.container.addChild(Draw.buildSpine('background', true, `expand_start`, {loop: false}));
        foreground = this.container.addChild(Draw.buildSpine('foreground', true, `expand`));
        // console.log(this.bg)
        
        this.bg.state.addListener({
            complete: entry =>{
                if (this.bg.alpha == 1) {
                    this.bg = this.container.addChild(Draw.buildSpine('background', true, `expand`, {loop: true}));
                    foreground = this.container.addChild(Draw.buildSpine('foreground', true, `expand`));
                }
            }
        })

        this.foreground = foreground
        //this.logo.position.set(135, 320);
        this.bg.alpha = 1;
        foreground.alpha = 1;

        
        return new Promise(res =>{
            let oldArmature = this.oldArmature;
            let oldFg = this.oldFg
            
            createjs.Tween.get(oldArmature)
            .to({alpha: 0}, time)
            .call(() =>{
                oldArmature.removeFromParent();
                oldFg.removeFromParent()
            })
            .call(() => res());

            createjs.Tween.get(this.bg)
            .to({alpha: 1}, time)
                .call(() =>{
                    this.oldArmature = this.bg;
                });
            createjs.Tween.get(foreground)
            .to({alpha: 1}, time)
            .call(() =>{
                this.oldFg = this.foreground
            });
        });
    },

    clearBgChildren() {
        app.bg.children.map((child) => {
            child.children.map((item, index, list) => {
                if (list.length > 2) {
                    item.removeFromParent()
                    list.shift()
                }
            })
        })
    },

    update(deltaTime){

    },

    setFreespinsAnimations() {
        // console.log("### Background => setFreespinsAnimations");
        this.bg.state.setAnimation(0, "freespins1", false);
        return;
    },

    setSpinsAnimations() {
        // console.log("### Background => setSpinsAnimations");
        this.bg.state.setAnimation(0, "spins", false);
        return;
    }
});
