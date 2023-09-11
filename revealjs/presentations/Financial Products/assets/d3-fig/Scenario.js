class Scenario {

  lineId = 'vline'
  scenarioId = 'scenario'
  getDescription;
  getX;
  //functions;
  axisDef;
  //graph;
  state;
  render;

  constructor({ getDescription, getX, axisDef, state, render }) {
    this.getDescription = getDescription;
    this.getX = getX;
    //this.functions = functions;
    this.axisDef = axisDef;
    this.state = state;
    this.render = render;
  }

  enter() {
    //this.render(this.state, false)
    // console.log(this)
    // let x = this.getX(this.state);
    // let description = this.getDescription(this.state);
    // addVerticalLineAt(this.lineId, this.state.graph, x, 'black', this.axisDef.y.range, this.state.profitFunctions)
    // addExplanation(this.scenarioId, this.state.graph, description);
    // state.lastTransition = this.enter.bind(this);

    this.state.lastTransition = (state) => {
      let x = this.getX(state);
      let description = this.getDescription(state);
      addVerticalLineAt(this.lineId, state.graph, x, 'black', this.axisDef.y.range, state.profitFunctions)
      addExplanation(this.scenarioId, state.graph, description);
    }
    this.render(this.state, true)
  }


  exit() {
    // this.render(this.state, false)
    // console.log(this)
    // removeElement(this.lineId, this.state.graph.svg)
    // removeElement(this.scenarioId)
    // tate.lastTransition = this.exit.bind(this);

    this.state.lastTransition = (state) => {
      removeElement(this.lineId, state.graph.svg)
      removeElement(this.scenarioId)
    }
    this.render(this.state, true)
  }
};   