import {MetricsPanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import './css/clock-panel.css!';

export class ClockCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector, $timeout) {
    super($scope, $injector);
    this.events.on('data-received', this._onDataReceived.bind(this));
    //this.updateClock();
  }

  _onDataReceived(data) {

    console.log(data);

  }

  updateClock() {
    this.time = moment().format('hh:mm:ss');
    this.$timeout(() => { this.updateClock(); }, 1000);
  }
}

//ClockCtrl.templateUrl = 'partials/module.html';