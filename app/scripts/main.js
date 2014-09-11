// CONSTANTES

var width = 900;
var height = 900;
var radius = 320;
var force_radius = 200;

// DATASETS

var data_regioes    = ["Norte","Nordeste","Centro-oeste","Sudeste","Sul"],
    data_estados    = [

        {UF: "AC", REGIAO: 0, NOME: "Acre"},
        {UF: "AM", REGIAO: 0, NOME: "Amazonas"},
        {UF: "AP", REGIAO: 0, NOME: "Amapá"},
        {UF: "PA", REGIAO: 0, NOME: "Pará"},
        {UF: "RR", REGIAO: 0, NOME: "Roraima"},
        {UF: "RO", REGIAO: 0, NOME: "Rondônia"},
        {UF: "TO", REGIAO: 0, NOME: "Tocantins"},

        {UF: 1, REGIAO: null},
        {UF: 2, REGIAO: null},


        {UF: "MA", REGIAO: 1, NOME: "Maranhão"},
        {UF: "PI", REGIAO: 1, NOME: "Piauí"},
        {UF: "CE", REGIAO: 1, NOME: "Ceará"},
        {UF: "BA", REGIAO: 1, NOME: "Bahia"},
        {UF: "RN", REGIAO: 1, NOME: "Rio Grande do Norte"},
        {UF: "PB", REGIAO: 1, NOME: "Paraíba"},
        {UF: "PE", REGIAO: 1, NOME: "Pernambuco"},
        {UF: "AL", REGIAO: 1, NOME: "Alagoas"},
        {UF: "SE", REGIAO: 1, NOME: "Sergipe"},
    
        {UF: 6, REGIAO: null},
        {UF: 7, REGIAO: null},
        
        {UF: "MT", REGIAO: 2, NOME: "Mato Grosso"},
        {UF: "GO", REGIAO: 2, NOME: "Goiás"},
        {UF: "MS", REGIAO: 2, NOME: "Mato Grosso do Sul"},
        {UF: "DF", REGIAO: 2, NOME: "Distrito Federal"},

        {UF: 11, REGIAO: null},
        {UF: 12, REGIAO: null},
        
        {UF: "ES", REGIAO: 3, NOME: "Espírito Santo"},
        {UF: "MG", REGIAO: 3, NOME: "Minas Gerais"},
        {UF: "RJ", REGIAO: 3, NOME: "Rio de Janeiro"},
        {UF: "SP", REGIAO: 3, NOME: "São Paulo"},

        {UF: 16, REGIAO: null},
        {UF: 17, REGIAO: null},
        
        {UF: "PR", REGIAO: 4, NOME: "Paraná"},
        {UF: "SC", REGIAO: 4, NOME: "Santa Catarina"},
        {UF: "RS", REGIAO: 4, NOME: "Rio Grande do Sul"},

        {UF: 21, REGIAO: null},
        {UF: 22, REGIAO: null},
        
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
            d.REGIAO = data_regioes[_.findWhere(data_estados,{UF: d.UF}).REGIAO];
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

var angle = d3.scale.ordinal()
    .rangePoints([0, 360], 1)
    .domain(data_estados.map(function(d) { return d.UF; }));

// VIS EVENTOS

var App = {
    nodes_uf: null,
    nodes_force: null,
    force: null,
    node: null,
    init: function() {

        App.buildStatesRadial();
        App.buildForceGraph();

    },

    buildStatesRadial: function(){

        App.nodes_uf = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .append("g")
        .attr("class", "nodes_uf")
        .selectAll("g")
        .data(data_estados.filter(function(d){
                return d.REGIAO != null;
            }))
        .enter().append("g")
            .attr("data-uf", function(d) { return d.UF; })
            .attr("transform", function(d) { return "rotate(" + angle(d.UF) + ")translate(" + radius + ",0)"; })
            .on('mouseover', function(d){
                App.events.mouseover_UF(d);
            })
            .on('mouseout', function(d){
                App.events.mouseout_UF(d);
            })

        /*
        App.nodes_uf.append("circle")
            .attr("r", 5)
            .attr("fill","#666");
        //*/

        App.nodes_uf.append("path")
            .attr("d", function(d){return d3line2([{x: 0, y: 0},{x: -10,y:0}]);})
            .attr("class", "UF-path")
            .style("stroke-width",2)
            .style("stroke","#666")
            .style("fill","none");

        App.nodes_uf.append("text")
            .attr("class", "UF-text")
            .attr("dy", ".35em")
            .attr("x", 16)
            .attr("fill","#666")
            .text(function(d) { return d.UF; })
            .filter(function(d) { return (angle(d.UF) + 105) % 360 > 180; }) // flipped
                .attr("x", -16)
                .attr("transform", "rotate(-180)")
            .style("text-anchor", "end");
    },

    buildForceGraph: function(){

        data_estados.map(function(o){
            var a = (180 + angle(o.UF)) / 180 * Math.PI,
                x = width * .5 - Math.cos(a) * force_radius,
                y = height * .5 - Math.sin(a) * force_radius;
            clusters[o.UF] = {x: x, y: y, radius: 50};
        });

        App.nodes_force = svg.append("g")
            .attr("class", "nodes_force")

        App.node = App.nodes_force.selectAll("circle.node");

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
                    App.events.mouseover_UF(d);
                })
                .on('mouseout', function(d){
                    App.events.mouseout_UF(d);
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
    },

    events: {
        mouseover_UF: function(d){
            d3.selectAll('.node[data-uf='+d.UF+']')
                .transition().duration(300)
                .attr('r',6);
            d3.selectAll('[data-uf='+d.UF+'] .UF-text')
                .transition().duration(300)
                .attr('fill','#fff');
            d3.selectAll('[data-uf='+d.UF+'] .UF-path')
                .transition().duration(300)
                .style('stroke','#fff');
        },
        mouseout_UF: function(d){
            d3.selectAll('.node[data-uf='+d.UF+']')
                .transition().duration(300)
                .attr('r',3);
            d3.selectAll('[data-uf='+d.UF+'] .UF-text')
                .transition().duration(300)
                .attr('fill','#666');
            d3.selectAll('[data-uf='+d.UF+'] .UF-path')
                .transition().duration(300)
                .style('stroke','#666');
        }
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
