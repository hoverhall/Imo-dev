/**
 * * @author Harupa Dzmitry <d7561985.gmail.com> on 13.09.2017.
 */
import GameModel from 'core/core/GameModel';
import app from 'core/app';
import GameSymbol from 'slotscore/core/components/GameSymbol';

// ToDo: wining per reel shpuld be
GameModel.prototype.anticipationMap = function () {
    return this.generateAnticipationMap([
        {
            count: 3,
            id: GameSymbol.SCATTER_ID,
            reels: [1, 1, 1, 1, 1]
        }]);
};

GameModel.prototype.rows = function(reelId = 1) {
    this.set('game.freespins.board', this.get('game.spins.board'));
    this.set('game.freespins.winlines', this.get('game.spins.winlines'));
    this.set('game.freespins.winscatters', this.get('game.spins.winscatters'));
    this.set('game.freespins.bet_per_line', this.get('game.spins.bet_per_line'));
    this.set('game.freespins.lines', this.get('game.spins.lines'));
    this.set('game.freespins.round_bet', this.get('game.spins.round_bet'));
    this.set('game.freespins.round_win', this.get('game.spins.round_win'));

    return this.board()[reelId - 1].length;
}
