// CONSTANTES

var width = 900;
var height = 900;
var radius = 320;
var force_radius = 300;

// DATASETS

var data_regioes    = ["Norte","Nordeste","Centro-oeste","Sudeste","Sul"],
    data_estados    = [

        {uf: "AC", regiao: 0},
        {uf: "AM", regiao: 0},
        {uf: "AP", regiao: 0},
        {uf: "PA", regiao: 0},
        {uf: "RR", regiao: 0},
        {uf: "RO", regiao: 0},
        {uf: "TO", regiao: 0},

        {uf: 1, regiao: null},
        {uf: 2, regiao: null},


        {uf: "MA", regiao: 1},
        {uf: "PI", regiao: 1},
        {uf: "CE", regiao: 1},
        {uf: "BA", regiao: 1},
        {uf: "RN", regiao: 1},
        {uf: "PB", regiao: 1},
        {uf: "PE", regiao: 1},
        {uf: "AL", regiao: 1},
        {uf: "SE", regiao: 1},
    
        {uf: 6, regiao: null},
        {uf: 7, regiao: null},
        
        {uf: "MT", regiao: 2},
        {uf: "GO", regiao: 2},
        {uf: "MS", regiao: 2},
        {uf: "DF", regiao: 2},

        {uf: 11, regiao: null},
        {uf: 12, regiao: null},
        
        {uf: "ES", regiao: 3},
        {uf: "MG", regiao: 3},
        {uf: "RJ", regiao: 3},
        {uf: "SP", regiao: 3},

        {uf: 16, regiao: null},
        {uf: 17, regiao: null},
        
        {uf: "PR", regiao: 4},
        {uf: "SC", regiao: 4},
        {uf: "RS", regiao: 4},

        {uf: 21, regiao: null},
        {uf: 22, regiao: null},
        
    ],
    data_candidatos = [],
    data_eventos    = [],
    data_categorias = [],
    clusters = {},
    clusters_pos = {}
    ;


// PROCESSAMENTO DE DADOS

function loadDataset(arr,callback) {
    var count = 0;
    var cbk = function(){
        count++;
        if(count < arr.length){
            loadCSV(arr[count], cbk);
        } else {
            if(callback) callback();
        }
    }
    loadCSV(arr[0],cbk);
}

function loadCSV(file,callback){

    // DVS para carregar CSV separado por ;

    var dsv = d3.dsv(";", "text/plain");

    dsv(file)
        .row(function(d){
            // alimenta array candidatos
            if(data_candidatos.indexOf(d.CANDIDATO) == -1){
                data_candidatos.push(d.CANDIDATO);
            }
            // alimenta array categorias
            if(data_categorias.indexOf(d.CATEGORIA) == -1){
                data_categorias.push(d.CATEGORIA);
            }
            // adiciona regiao
            d.REGIAO = data_regioes[_.findWhere(data_estados,{uf: d.UF}).regiao];
            // formata a data
            var format = d3.time.format("%d.%m.%Y");
            d.DATA_STRING = d.DATA;
            d.DATA = format.parse(d.DATA);
            // force layout vars
            d.x = width * .5 - Math.random() * 200;
            d.y = height * .5 - Math.random() * 200;
            d.radius = 5;
            d.cluster = d.UF;
            // retorna obj completo
            return d;
        })
        .get(function(error, rows){
            // alimenta array eventos
            data_eventos = _.union(rows,data_eventos);
            // log
            console.log('loaded CSV!');
            // chama callback
            if(callback) callback();
        });

    console.log('loading file', file);
}

var d3line2 = d3.svg.line()
    .x(function(d){return d.x;})
    .y(function(d){return d.y;})
    .interpolate("linear"); 

// INICIA GRAFOS

var svg = d3.select("#vis").append("svg")
    .attr("width", width)
    .attr("height", height);

// VIS ESTADOS RADIAL

var angle = d3.scale.ordinal()
    .rangePoints([0, 360], 1)
    .domain(data_estados.map(function(d) { return d.uf; }));

var nodes_uf = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .append("g")
    .attr("class", "nodes_uf")
    .selectAll("g")
        .data(data_estados.filter(function(d){
            return d.regiao != null;
        }))
    .enter().append("g")
        .attr("transform", function(d) { return "rotate(" + angle(d.uf) + ")translate(" + radius + ",0)"; });

/*
nodes_uf.append("circle")
    .attr("r", 5)
    .attr("fill","#666");
//*/

nodes_uf.append("path")
    .attr("d", function(d){return d3line2([{x: 0, y: 0},{x: -10,y:0}]);})
    .style("stroke-width",2)
    .style("stroke","#666")
    .style("fill","none");

nodes_uf.append("text")
    .attr("dy", ".35em")
    .attr("x", 16)
    .attr("fill","#666")
    .text(function(d) { return d.uf; })
    .filter(function(d) { return (angle(d.uf) + 120) % 360 > 180; }) // flipped
        .attr("x", -16)
        .attr("transform", "rotate(-180)")
    .style("text-anchor", "end");


// VIS EVENTOS

var nodes_force = svg.append("g")
    .attr("class", "nodes_force")

var App = {
    force: null,
    node: null,
    init: function() {

        data_estados.map(function(o){
            var a = (180 + angle(o.uf)) / 180 * Math.PI,
                x = width * .5 - Math.cos(a) * force_radius,
                y = height * .5 - Math.sin(a) * force_radius;
            clusters[o.uf] = {x: x, y: y, radius: 50};
        });

        App.node = nodes_force.selectAll("circle.node");

        App.force = d3.layout.force()
            .nodes(data_eventos)
            .size([width, height])
            .gravity(.02)
            .charge(0)
            .on("tick", App.tick)
            .start();

        App.node = App.node.data(data_eventos);

        App.node.enter()
            .append('circle')
                .attr("r", 3)
                .style("fill", function(d) { return App.color(d.CANDIDATO); })
                .attr("class", "node")
                .attr("data-uf", function(d) { return d.UF; })
                .attr("data-candidato", function(d) { return d.CANDIDATO.split(" ").join("_"); })
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on('mouseover', function(d){
                    console.log("mouse over",d.UF)
                    d3.selectAll('.node[data-uf='+d.UF+']')
                        .transition().duration(300)
                        .attr('r',10);
                })
                .on('mouseout', function(d){
                    d3.selectAll('.node[data-uf='+d.UF+']')
                        .transition().duration(300)
                        .attr('r',3);
                })
            .call(App.force.drag);
        
        console.log('FORCE!');
    },
    tick: function(e){

        App.node
            .each(App.cluster(10 * e.alpha * e.alpha))
            .each(App.collide(.5))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        
        console.log('TICK!');

    },
    color: function(candidato){
        switch(candidato){
            case "AECIO NEVES":
                return '#3333ff';
                break;
            case "MARINA SILVA":
                return '#ffee00';
                break;
            case "DILMA ROUSSEFF":
                return '#cc0000';
                break;
        }
    },
    cluster: function(alpha){
        return function(d) {
            var cluster = clusters[d.cluster];
            //console.log(cluster.x,cluster.y)
            if (cluster === d) return;
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + cluster.radius;
            if (l != r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                //cluster.x += x;
                //cluster.y += y;
            }
        };
    },
    collide: function(alpha){
        var quadtree = d3.geom.quadtree(data_eventos),
            padding = 2,
            clusterPadding = 2,
            maxRadius = 10;
        return function(d) {
            var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }
};

// CARREGA DATASET E INICIA

var opt = 2;

switch(opt){
    case 1:
    loadDataset([
        'dados_presidenciaveis_revistapiaui_aecioneves.csv',
        'dados_presidenciaveis_revistapiaui_dilmarousseff.csv',
        'dados_presidenciaveis_revistapiaui_marinasilva.csv'
    ], App.init);
    break;
    case 2:
    loadDataset([
        'dados_presidenciaveis_revistapiaui_aecionevesx4.csv',
        'dados_presidenciaveis_revistapiaui_dilmarousseffx4.csv',
        'dados_presidenciaveis_revistapiaui_marinasilvax4.csv'
    ], App.init);
    break;
}
