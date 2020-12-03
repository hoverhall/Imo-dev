import BackgroundShadow from 'core/components/Draw/BackgroundShadow';

Object.assign(BackgroundShadow.prototype, {
    show(time) {
        return new Promise(res => {
            createjs.Tween.get(this.bgContainer, {override: true})
                .to({alpha: 0.5}, time ? time : 200)
                .call(() => res());

            // this.bgContainer.alpha = 0.7;
        });
    },

    showIfNeed(time) {
        if (this.bgContainer.alpha > 0)
            return Promise.resolve();
        return this.show(time);
    },

    hide() {
        // if (this.bgContainer.alpha === 0)
        //     return Promise.resolve();

        // return new Promise(res => {
        //     createjs.Tween.get(this.bgContainer, {override: true})
        //         .to({alpha: 0}, 500)
        //         .call(res);
        // });
    },

    hold() {
        if (this.bgContainer.alpha === 0)
            return Promise.resolve();

        return new Promise(res => {
            createjs.Tween.get(this.bgContainer, {override: true})
                .to({alpha: 0}, 500)
                .call(res);
        });
    },

});