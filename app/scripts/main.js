// CONSTANTES

var width = 900;
var height = 900;
var radius = 320;
var force_radius = 200;

// DATASETS

var data_regioes    = ["Norte","Nordeste","Centro-oeste","Sudeste","Sul"],
    data_estados    = [

        {UF: "AC", REGIAO: 0, NOME: "Acre",      CAPITAL: "Rio Branco"},
        {UF: "AM", REGIAO: 0, NOME: "Amazonas",  CAPITAL: "Manaus"},
        {UF: "AP", REGIAO: 0, NOME: "Amapá",     CAPITAL: "Macapá"},
        {UF: "PA", REGIAO: 0, NOME: "Pará",      CAPITAL: "Belém"},
        {UF: "RR", REGIAO: 0, NOME: "Roraima",   CAPITAL: "Boa Vista"},
        {UF: "RO", REGIAO: 0, NOME: "Rondônia",  CAPITAL: "Porto Velho"},
        {UF: "TO", REGIAO: 0, NOME: "Tocantins", CAPITAL: "Palmas"},

        {UF: "NULL1", REGIAO: null, NOME: null, CAPITAL: null},
        {UF: "NULL2", REGIAO: null, NOME: null, CAPITAL: null},

        {UF: "MA", REGIAO: 1, NOME: "Maranhão",            CAPITAL: "São Luis"},
        {UF: "PI", REGIAO: 1, NOME: "Piauí",               CAPITAL: "Teresina"},
        {UF: "CE", REGIAO: 1, NOME: "Ceará",               CAPITAL: "Fortaleza"},
        {UF: "BA", REGIAO: 1, NOME: "Bahia",               CAPITAL: "Salvador"},
        {UF: "RN", REGIAO: 1, NOME: "Rio Grande do Norte", CAPITAL: "Natal"},
        {UF: "PB", REGIAO: 1, NOME: "Paraíba",             CAPITAL: "João Pessoa"},
        {UF: "PE", REGIAO: 1, NOME: "Pernambuco",          CAPITAL: "Recife"},
        {UF: "AL", REGIAO: 1, NOME: "Alagoas",             CAPITAL: "Maceió"},
        {UF: "SE", REGIAO: 1, NOME: "Sergipe",             CAPITAL: "Aracaju"},
    
        {UF: "NULL3", REGIAO: null, NOME: null, CAPITAL: null},
        {UF: "NULL4", REGIAO: null, NOME: null, CAPITAL: null},
        
        {UF: "GO", REGIAO: 2, NOME: "Goiás",              CAPITAL: "Goiânia"},
        {UF: "DF", REGIAO: 2, NOME: "Distrito Federal",   CAPITAL: "Brasília"},
        {UF: "MT", REGIAO: 2, NOME: "Mato Grosso",        CAPITAL: "Cuiaba"},
        {UF: "MS", REGIAO: 2, NOME: "Mato Grosso do Sul", CAPITAL: "Campo Grande"},

        {UF: "NULL5", REGIAO: null, NOME: null, CAPITAL: null},
        {UF: "NULL6", REGIAO: null, NOME: null, CAPITAL: null},
        
        {UF: "ES", REGIAO: 3, NOME: "Espírito Santo", CAPITAL: "Vitória"},
        {UF: "MG", REGIAO: 3, NOME: "Minas Gerais",   CAPITAL: "Belo Horizonte"},
        {UF: "RJ", REGIAO: 3, NOME: "Rio de Janeiro", CAPITAL: "Rio de Janeiro"},
        {UF: "SP", REGIAO: 3, NOME: "São Paulo",      CAPITAL: "São Paulo"},

        {UF: "NULL7", REGIAO: null, NOME: null, CAPITAL: null},
        {UF: "NULL8", REGIAO: null, NOME: null, CAPITAL: null},
        
        {UF: "PR", REGIAO: 4, NOME: "Paraná",            CAPITAL: "Curitiba"},
        {UF: "SC", REGIAO: 4, NOME: "Santa Catarina",    CAPITAL: "Florianópolis"},
        {UF: "RS", REGIAO: 4, NOME: "Rio Grande do Sul", CAPITAL: "Porto Alegre"},

        {UF: "NULL9", REGIAO: null, NOME: null, CAPITAL: null},
        {UF: "NULL10", REGIAO: null, NOME: null, CAPITAL: null},
        
    ],
    data_candidatos = [],
    data_eventos    = [],
    data_categorias = [],
    clusters = {}
    ;


// PROCESSAMENTO DE DADOS

function loadDataset(arr,callback) {
    var count = 0;
    var id = 0;
    var cbk = function(id){
        count++;
        if(count < arr.length){
            loadCSV(arr[count], id, cbk);
        } else {
            if(callback) callback();
        }
    }
    loadCSV(arr[0],id,cbk);
}

function loadCSV(file,id,callback){

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
            // adiciona id
            d.ID = id; id++;
            // adiciona regiao
            d.REGIAO = data_regioes[_.findWhere(data_estados,{UF: d.UF}).REGIAO];
            // formata a data
            var format = d3.time.format("%d.%m.%Y");
            d.DATA_STRING = d.DATA;
            d.DATA = format.parse(d.DATA);
            // force layout vars
            var CAPITAL = _.findWhere(data_estados,{UF: d.UF}).CAPITAL;
            d.x = width * .5 - Math.random() * 200;
            d.y = height * .5 - Math.random() * 200;
            d.radius = CAPITAL == d.MUNICIPIO ? 3 : 2;
            d.scale = 1;
            d.cluster = d.UF;
            if(!clusters[d.UF] || (clusters[d.UF].MUNICIPIO != CAPITAL && CAPITAL == d.MUNICIPIO)){
                clusters[d.UF] = d;
            }
            // retorna obj completo
            return d;
        })
        .get(function(error, rows){
            // alimenta array eventos
            data_eventos = _.union(rows,data_eventos);
            // log
            console.log('loaded CSV!');
            // chama callback
            if(callback) callback(id);
        });

    console.log('loading file', file);
}

var d3line2 = d3.svg.line()
    .x(function(d){return d.x;})
    .y(function(d){return d.y;})
    .interpolate("linear"); 

// INICIA GRAFOS

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 5])
    .on("zoom", function(){
        vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    });

var wrapper = d3.select("#vis-wrapper").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g').call(zoom);

var rect = wrapper.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#222')
    .style("pointer-events", "all");

var vis = wrapper.append('g');

var angle = d3.scale.ordinal()
    .rangePoints([0, 360], 1)
    .domain(data_estados.map(function(d) { return d.UF; }));


function zoomed() {
    
}
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

        App.nodes_uf = vis.append("g")
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
            .attr("x", -12)
            .attr("y", 16)
            .attr("fill","#666")
            .text(function(d) { return d.UF; })
            .attr("transform", "rotate(-90)")
            .filter(function(d) { return (angle(d.UF)) % 360 > 180; }) // flipped
                .attr("transform", "rotate(90)")
                .attr("x", 12)
                .attr("y", -16)
            .style("text-anchor", "end");
    },

    buildForceGraph: function(){

        data_estados.map(function(o){
            var a = (180 + angle(o.UF)) / 180 * Math.PI,
                x = width * .5 - Math.cos(a) * force_radius,
                y = height * .5 - Math.sin(a) * force_radius;
            
            /*
            if(clusters[o.UF]){
                clusters[o.UF].x = x;
                clusters[o.UF].x = y;
            }
            */
            clusters[o.UF] = {x: x, y: y, radius: 50};
        });

        App.nodes_force = vis.append("g")
            .attr("class", "nodes_force")

        App.node = App.nodes_force.selectAll("circle.node");

        App.force = d3.layout.force()
            .nodes(data_eventos)
            .size([width, height])
            .gravity(.02)
            .charge(0)
            .on("tick", App.tick)
            .start();

        App.node = App.node.data(data_eventos, function(d){ return d.ID;});

        App.node.enter()
            .append('circle')
                .attr("r", function(d) { return d.radius * d.scale; })
                .style("fill", function(d) { return App.color(d.CANDIDATO); })
                .attr("class", "node")
                .attr("data-uf", function(d) { return d.UF; })
                .attr("data-candidato", function(d) { return d.CANDIDATO.split(" ").join("_"); })
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .on('mouseover', function(d){
                    App.events.mouseover_node(d);
                })
                .on('mouseout', function(d){
                    App.events.mouseout_node(d);
                })
            .call(App.force.drag);
        
        vis.on("mousemove", function() {
            var p1 = d3.mouse(this);
            //root.px = p1[0];
            //root.py = p1[1];
            App.force.resume();
        });

        console.log('FORCE!');
    },

    tick: function(e){

        App.node
            .each(App.cluster(10 * e.alpha * e.alpha))
            .each(App.collide(.5))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        
        //console.log('TICK!');

    },
    color: function(candidato){
        switch(candidato){
            case "AÉCIO NEVES":
                return '#127bbf';
                break;
            case "MARINA SILVA":
                return '#e8d354';
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
                r = d.radius * d.scale + cluster.radius;
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
            clusterPadding = 10,
            maxRadius = 10;
        return function(d) {
            var r = d.radius * d.scale + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius * d.scale + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
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
        mouseover_node: function(d){
            /*_.findWhere(data_eventos,{ID: d.ID}).scale = 2;
            App.node
                .data(data_eventos, function(d){ return d.ID;})
                .transition()
                .attr("r", function(d) { console.log(d.scale); return d.radius * d.scale; })
                ;
            App.force.resume();*/
            App.events.ligaUF(d);
        },
        mouseout_node: function(d){
            /*_.findWhere(data_eventos,{ID: d.ID}).scale = 1;
            App.node
                .data(data_eventos, function(d){ return d.ID;})
                .transition()
                .attr("r", function(d) { console.log(d.scale); return d.radius * d.scale; })
                ;
            App.force.resume();*/
            App.events.desligaUF(d);
        },
        mouseover_UF: function(d){
            d3.selectAll('.node:not([data-uf='+d.UF+'])')
                .transition().duration(300)
                .style("opacity",.1)
            App.events.ligaUF(d);

        },
        mouseout_UF: function(d){
            d3.selectAll('.node:not([data-uf='+d.UF+'])')
                .transition().duration(300)
                .style("opacity",1)
            App.events.desligaUF(d);
        },
        ligaUF: function(d){
            d3.selectAll('[data-uf='+d.UF+'] .UF-text')
                .transition().duration(300)
                .attr('fill','#fff');
            d3.selectAll('[data-uf='+d.UF+'] .UF-path')
                .transition().duration(300)
                .style('stroke','#fff');
        },
        desligaUF: function(d){
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


loadDataset([
    'dados_aecioneves.csv',
    'dados_dilmarousseff.csv',
    'dados_marinasilva.csv'
], App.init);

