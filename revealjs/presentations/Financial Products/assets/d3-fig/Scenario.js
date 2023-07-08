class Scenario {

    lineId = 'vline'
    scenarioId = 'scenario'
    description;
    x;
    functions;
    axisDef;
    graph;

    constructor({description, x, functions, axisDef, graph}) {
        this.description = description;
        this.x = x;
        this.functions = functions;
        this.axisDef = axisDef;
        this.graph = graph;
    }

    enter() {
        console.log(this)
        addVerticalLineAt(this.lineId, graph, this.x, 'black', this.axisDef.y.range, this.functions) 
        addExplanation(this.scenarioId, graph, this.description)    ;
    }


    exit() {
        console.log(this)
        removeElement(this.lineId, graph.svg)
        removeElement(this.scenarioId)
    }
};   