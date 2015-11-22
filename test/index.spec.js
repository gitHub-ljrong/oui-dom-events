import spies from 'chai-spies';
import chai, { expect } from 'chai';
import triggerEvent from './triggerEvent.js';
import Events from '../src/index.js';

chai.use(spies);

function injectHTML() {
  document.body.innerHTML = `
  <div id="event-test">
    <ul>
      <li class='green'>hello</li>
      <li class='green'>world</li>
      <li class='red'>again</li>
      <li class='red'>from</li>
      <li class='green'>cam</li>
    </ul>
  </div>
  `;
};

function uninjectHTML() {
  var el = document.querySelector('#event-test');
  el.parentNode.removeChild(el);
};

describe('Events', () => {
  describe('.on and .off', () => {
    beforeEach(() => {
      injectHTML();
    });

    afterEach(() => {
      uninjectHTML();
    });

    it('on should invoke callback when event fired', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click', callback);

      triggerEvent(el, 'click');
      expect(callback).to.have.been.called.once;
    });

    it('on bind same callback twice will only invoke once', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click', callback);
      Events.on(el, 'click', callback);

      triggerEvent(el, 'click');
      expect(callback).to.have.been.called.once;
    });

    it('on can bind two events', () => {
      let callback1 = chai.spy();
      let callback2 = chai.spy();
      let callback3 = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click', callback1);
      Events.on(el, 'click', callback2);

      triggerEvent(el, 'click');
      expect(callback1).to.have.been.called.once;
      expect(callback2).to.have.been.called.once;
      expect(callback3).to.have.not.been.called;
    });

    it('off can remove on event', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click', callback);
      Events.off(el, 'click', callback);

      triggerEvent(el, 'click');
      expect(callback).to.have.not.been.called;
    });
  });

  describe('once', () => {
    beforeEach(() => {
      injectHTML();
    });

    afterEach(() => {
      uninjectHTML();
    });

    it('once will only invoke callback once', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.once(el, 'click', callback);

      triggerEvent(el, 'click');
      triggerEvent(el, 'click');
      expect(callback).to.have.been.called.once;
    });

    it('on will invoke callback many times as you trigger', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click', callback);

      triggerEvent(el, 'click');
      triggerEvent(el, 'click');
      triggerEvent(el, 'click');
      expect(callback).to.have.been.called.exactly(3);
    });

    it('off can unbind once', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.once(el, 'click', callback);
      Events.off(el, 'click');

      triggerEvent(el, 'click');
      expect(callback).to.have.not.been.called;
    });
  });

  describe('with namespace', () => {
    beforeEach(() => {
      injectHTML();
    });

    afterEach(() => {
      uninjectHTML();
    });

    it('on can bind with namespace', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click.testns', callback);

      triggerEvent(el, 'click');
      expect(callback).to.have.been.called.once;
    });

    it('off can remove event with namespace', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click.testns', callback);
      Events.off(el, 'click', callback);

      triggerEvent(el, 'click');
      expect(callback).to.have.not.been.called;
    });

    it('off with namespace only remove that namespace', () => {
      let callback1 = chai.spy();
      let callback2 = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click.testns', callback1);
      Events.on(el, 'click.anotherns', callback2);
      Events.off(el,'click.anotherns');

      triggerEvent(el, 'click');
      expect(callback1).to.have.been.called.once;
      expect(callback2).to.have.not.been.called;
    });

    it('off without namespace will remove all events', () => {
      let callback1 = chai.spy();
      let callback2 = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click.testns', callback1);
      Events.on(el, 'click.anotherns', callback2);
      Events.off(el,'click');

      triggerEvent(el, 'click');
      expect(callback1).to.have.not.been.called;
      expect(callback2).to.have.not.been.called;
    });
  });


  describe('event delegation', () => {
    beforeEach(() => {
      injectHTML();
    });

    afterEach(() => {
      uninjectHTML();
    });

    it('delegate can bind event', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.delegate(el, 'li.red', 'click', callback);

      triggerEvent(document.querySelector('#event-test ul li.red'), 'click');
      expect(callback).to.have.been.called.once;

      triggerEvent(document.querySelector('#event-test ul li.green'), 'click');
      expect(callback).to.have.not.been.called;
    });

    it('undelegate can remove event delegation', () => {
      let el = document.querySelector('#event-test ul');
      let callback1 = chai.spy();
      let callback2 = chai.spy();
      Events.delegate(el, 'li.red', 'click', callback1);
      Events.delegate(el, 'li.green', 'click', callback2);

      Events.undelegate(el, 'li.red', 'click');

      triggerEvent(document.querySelector('#event-test ul li.red'), 'click');
      triggerEvent(document.querySelector('#event-test ul li.green'), 'click');
      expect(callback1).to.have.not.been.called;
      expect(callback2).to.have.been.called.once;
    });

    it('off can also remove event delegation', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.delegate(el, 'li.red', 'click', callback);
      Events.off(el, 'li.red', 'click');

      triggerEvent(el, 'click');
      expect(callback).to.have.not.been.called;
    });

    it('off with namespace only remove that namespace', () => {
      let callback1 = chai.spy();
      let callback2 = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.delegate(el, 'li.red', 'click.testns', callback1);
      Events.delegate(el, 'li.red', 'click.anotherns', callback2);
      Events.off(el,'click.anotherns');

      triggerEvent(el.querySelector('li.red'), 'click');
      expect(callback1).to.have.been.called.once;
      expect(callback2).to.have.not.been.called;
    });

    it('off without namespace will remove all events', () => {
      let callback1 = chai.spy();
      let callback2 = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.delegate(el, 'li.red', 'click.testns', callback1);
      Events.delegate(el, 'li.red', 'click.anotherns', callback2);
      Events.off(el,'click.anotherns');

      triggerEvent(el.querySelector('li.red'), 'click');
      expect(callback1).to.have.not.been.called;
      expect(callback2).to.have.not.been.called;
    });
  });

  describe('trigger', () => {
    beforeEach(() => {
      injectHTML();
    });

    afterEach(() => {
      uninjectHTML();
    });

    it('can trigger events', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'click', callback);

      Events.trigger(el, 'click');
      expect(callback).to.have.been.called.once;
    });

    it('can trigger scroll events', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'scroll', callback);

      Events.trigger(el, 'scroll');
      expect(callback).to.have.been.called.once;
    });

    it('can trigger resize events', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'resize', callback);

      Events.trigger(el, 'resize');
      expect(callback).to.have.been.called.once;
    });

    it('can trigger with params', () => {
      let callback = chai.spy();
      let el = document.querySelector('#event-test ul');
      Events.on(el, 'resize', callback);

      Events.trigger(el, 'resize', {foo: 'bar'});
      expect(callback).to.have.been.called.once;
    });
  });
});
