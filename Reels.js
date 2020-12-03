import {app} from 'core/app';
import Reels from 'core/components/Reels';
import GameSymbol from 'slotscore/core/components/GameSymbol';
import Sound from 'core/core/Sound';

Object.assign(Reels.prototype, {

    // _stop({unholdReels, anticipationMap, normalState, intervalNormal, intervalAnticipation, extraDelay = 0}) {
    //     const quickSpin = this.quickSpin;

    //     // promises that resolves on each reel stop event
    //     const stopDefers = unholdReels.map(() => utils.deferred());

    //     // reel's stop interval
    //     const stopDeltas = unholdReels.map(({index}) => {
    //         const isAnticipation = anticipationMap[index];
    //         return isAnticipation ? intervalAnticipation : intervalNormal;
    //     });
    //     // common delay before first reel stop
    //     const delayBeforeFirstStop = intervalNormal;

    //     // measured durations depending on stop type
    //     const measuredDurations = unholdReels.map(({reel, index}) => {
    //         const isAnticipation = anticipationMap[index];
    //         const stopType = isAnticipation ? Reel.STATE.STOPPING_ANTICIPATION : normalState;

    //         return reel.getMeasuredStopDuration(quickSpin, stopType);
    //     });

    //     // measured duration for normal stopping type
    //     const measuredDurationsNormal = unholdReels.map(({reel}) => reel.getMeasuredStopDuration(quickSpin, normalState));

    //     const now = Date.now();
    //     // delays are delays before calling reel.stop
    //     let delays = unholdReels.reduce((delays, {reel, index}, unholdIndex) => {
    //         if (unholdIndex === 0) {
    //             // first
    //             delays[0] = 0;
    //         } else {
    //             delays[unholdIndex] = delays[unholdIndex - 1] + stopDeltas[unholdIndex]
    //                 + measuredDurations[unholdIndex - 1] - measuredDurationsNormal[unholdIndex];
    //         }

    //         return delays;
    //     }, []);

    //     // if we have some negative delays - increase all other delays
    //     const minStopDelay = Math.min(...delays);
    //     if (minStopDelay < 0) {
    //         delays = delays.map(d => d - minStopDelay);
    //     }

    //     // add delay before first stop call
    //     delays = delays.map(d => d + delayBeforeFirstStop + extraDelay);

    //     const firstReelIndex = (unholdReels[0] || {}).index;

    //     const measuredStop = measuredDurations.map((d, i) => d + delays[i]);

    //     const stopTS = measuredStop.map(time => now + time);

    //     unholdReels.forEach(({reel, index}, unholdIndex) => {
    //         reel.once(Reel.EVENT.STOP, () => stopDefers[unholdIndex].resolve());

    //         const isAnticipation = anticipationMap[index];
    //         const ifFirstToStop = index === firstReelIndex;
    //         const stopType = isAnticipation ? Reel.STATE.STOPPING_ANTICIPATION : normalState;

    //         const tween = this.tween()
    //             .wait(delays[unholdIndex])
    //             .call(() => {
    //                 if (ifFirstToStop && isAnticipation) {
    //                     // on first reel we can emit event only on stop call
    //                     reel.emit(Reel.EVENT.ANTICIPATION_STOPPING);
    //                 }
    //                 reel.stop(stopType, measuredStop[unholdIndex] - tween.position);
    //             })
    //             .wait(100e3); // buffer
    //         tween.advance(0);

    //         // start acticipation stopping event
    //         if (!ifFirstToStop) {
    //             // todo respect stop order
    //             const nextUnholdReelInfo = unholdReels[unholdIndex + 1];
    //             if (nextUnholdReelInfo) {
    //                 const {reel: nextReel, index: nextIndex} = nextUnholdReelInfo;
    //                 const nextAnticipation = anticipationMap[nextIndex];
    //                 if (nextAnticipation && nextReel) {
    //                     const emitAnticipationStopping = () => {
    //                         if (this._skipping) return;
    //                         setTimeout(() => {
    //                             nextReel.emit(Reel.EVENT.ANTICIPATION_STOPPING);
    //                         }, 500)
    //                     };

    //                     reel.once(Reel.EVENT.STOP_BEFORE_BACK_OUT, emitAnticipationStopping);
    //                     nextReel.once(Reel.EVENT.STOP, () => {
    //                         // if nextreel stop somehow before current reel - don't emit event
    //                         reel.off(Reel.EVENT.STOP_BEFORE_BACK_OUT, emitAnticipationStopping);
    //                     });
    //                 }
    //             }
    //         }
    //         // end anticipations stopping event
    //     });

    //     return {
    //         promise: Promise.all([...stopDefers.map(d => d.promise)]),
    //         stopTS: stopTS
    //     };

        
    // },

    forEachSymbol(callback) {
        try {
            let cols = Math.min(app.model.cols(), this.reels.length);
            for (let i = 0; i < cols; ++i) {
                let rows = app.model.rows(this.reels[i].id);
                for (let j = 0; j < rows; ++j) {
                    callback.call(this, this.reels[i].symbols[j + 1], i + this.reelOffset, j);
                }
            }
        }catch (e){
            console.error(e)
        }
    }
})