// CONSTANTES

var width = 600;
var height = 600;
var radius = 270;
var force_radius = 240;
var timeline_min = null;
var timeline_max = null;
var timeline = [];
var angle_offset = 18;

// DATASETS

var data_regioes    = ['Norte','Nordeste','Centro-oeste','Sudeste','Sul'],
    data_estados    = [
        
        {UF: 'ES', REGIAO: 3, NOME: 'Espírito Santo', CAPITAL: 'Vitória'},
        {UF: 'MG', REGIAO: 3, NOME: 'Minas Gerais',   CAPITAL: 'Belo Horizonte'},
        {UF: 'RJ', REGIAO: 3, NOME: 'Rio de Janeiro', CAPITAL: 'Rio de Janeiro'},
        {UF: 'SP', REGIAO: 3, NOME: 'São Paulo',      CAPITAL: 'São Paulo'},

        {UF: 'NULL7', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL8', REGIAO: null, NOME: null, CAPITAL: null},
        
        {UF: 'PR', REGIAO: 4, NOME: 'Paraná',            CAPITAL: 'Curitiba'},
        {UF: 'SC', REGIAO: 4, NOME: 'Santa Catarina',    CAPITAL: 'Florianópolis'},
        {UF: 'RS', REGIAO: 4, NOME: 'Rio Grande do Sul', CAPITAL: 'Porto Alegre'},

        {UF: 'NULL9', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL10', REGIAO: null, NOME: null, CAPITAL: null},

        {UF: 'MS', REGIAO: 2, NOME: 'Mato Grosso do Sul', CAPITAL: 'Campo Grande'},
        {UF: 'GO', REGIAO: 2, NOME: 'Goiás',              CAPITAL: 'Goiânia'},
        {UF: 'DF', REGIAO: 2, NOME: 'Distrito Federal',   CAPITAL: 'Brasília'},
        {UF: 'MT', REGIAO: 2, NOME: 'Mato Grosso',        CAPITAL: 'Cuiaba'},
        

        {UF: 'NULL5', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL6', REGIAO: null, NOME: null, CAPITAL: null},

        
        {UF: 'AC', REGIAO: 0, NOME: 'Acre',      CAPITAL: 'Rio Branco'},
        {UF: 'AM', REGIAO: 0, NOME: 'Amazonas',  CAPITAL: 'Manaus'},
        {UF: 'RO', REGIAO: 0, NOME: 'Rondônia',  CAPITAL: 'Porto Velho'},
        {UF: 'RR', REGIAO: 0, NOME: 'Roraima',   CAPITAL: 'Boa Vista'},
        {UF: 'PA', REGIAO: 0, NOME: 'Pará',      CAPITAL: 'Belém'},
        {UF: 'AP', REGIAO: 0, NOME: 'Amapá',     CAPITAL: 'Macapá'},
        {UF: 'TO', REGIAO: 0, NOME: 'Tocantins', CAPITAL: 'Palmas'},


        {UF: 'NULL1', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL2', REGIAO: null, NOME: null, CAPITAL: null},

        {UF: 'MA', REGIAO: 1, NOME: 'Maranhão',            CAPITAL: 'São Luis'},
        {UF: 'PI', REGIAO: 1, NOME: 'Piauí',               CAPITAL: 'Teresina'},
        {UF: 'CE', REGIAO: 1, NOME: 'Ceará',               CAPITAL: 'Fortaleza'},    
        {UF: 'RN', REGIAO: 1, NOME: 'Rio Grande do Norte', CAPITAL: 'Natal'},
        {UF: 'PB', REGIAO: 1, NOME: 'Paraíba',             CAPITAL: 'João Pessoa'},
        {UF: 'PE', REGIAO: 1, NOME: 'Pernambuco',          CAPITAL: 'Recife'},
        {UF: 'AL', REGIAO: 1, NOME: 'Alagoas',             CAPITAL: 'Maceió'},
        {UF: 'SE', REGIAO: 1, NOME: 'Sergipe',             CAPITAL: 'Aracaju'},
        {UF: 'BA', REGIAO: 1, NOME: 'Bahia',               CAPITAL: 'Salvador'},
    
        {UF: 'NULL3', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL4', REGIAO: null, NOME: null, CAPITAL: null},
        
    ],
    data_candidatos = [],
    data_eventos    = [],
    data_categorias = [],
    clusters = {}
    ;

var locale = d3.locale({
    'decimal': ',',
    'thousands': '.',
    'grouping': [3],
    'currency': ['$', ''],
    'dateTime': '%a %b %e %X %Y',
    'date': '%d/%m/%Y',
    'time': '%H:%M:%S',
    'periods': ['AM', 'PM'],
    'days': ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    'shortDays': ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    'months': ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    'shortMonths': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
});

// PROCESSAMENTO DE DADOS

function loadCSV(file,id,callback){

    // DVS para carregar CSV separado por ;

    var dsv = d3.dsv(';', 'text/plain');

    dsv(file)
        .row(function(d){
            // alimenta array candidatos
            if(data_candidatos.indexOf(d.CANDIDATO) === -1){
                data_candidatos.push(d.CANDIDATO);
            }
            // alimenta array categorias
            if(data_categorias.indexOf(d.CATEGORIA) === -1){
                data_categorias.push(d.CATEGORIA);
            }
            // adiciona id
            d.ID = id; id++;
            // adiciona regiao
            d.REGIAO = data_regioes[_.findWhere(data_estados,{UF: d.UF}).REGIAO];
            // formata a data
            var format = d3.time.format('%d.%m.%Y');
            d.DATA_STRING = d.DATA;
            d.DATA = format.parse(d.DATA);
            // unixtime
            var unixtime = +d.DATA;
            if(timeline_min === null || timeline_min > unixtime){
                timeline_min = unixtime;
            }
            if(timeline_max === null || timeline_max < unixtime){
                timeline_max = unixtime;
            }
            if(timeline.indexOf(unixtime) === -1){
                timeline.push(unixtime);
            }
            //console.log();
            // force layout vars
            var CAPITAL = _.findWhere(data_estados,{UF: d.UF}).CAPITAL;
            d.radius = CAPITAL === d.MUNICIPIO ? 5 : 3;
            d.scale = 1;
            d.cluster = d.UF;
            if(!clusters[d.UF] || (clusters[d.UF].MUNICIPIO !== CAPITAL && CAPITAL === d.MUNICIPIO)){
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
            if(callback){
                callback(id);
            }
        });

    console.log('loading file', file);
}


function loadDataset(arr,callback) {
    var count = 0;
    var id = 0;
    var cbk = function(id){
        count++;
        if(count < arr.length){
            loadCSV(arr[count], id, cbk);
        } else {
            if(callback){
                callback();
            }
        }
    };
    loadCSV(arr[0],id,cbk);
}

// INICIA GRAFOS

var zoom, wrapper, rect, vis, angle, d3line2;

zoom = d3.behavior.zoom()
    .scaleExtent([1, 5])
    .on('zoom', function(){
        vis.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    });

wrapper = d3.select('#vis-wrapper').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    //.call(zoom)
    ;

rect = wrapper.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#fff')
    .attr('opacity', 0)
    .style('pointer-events', 'all');

vis = wrapper.append('g');

angle = d3.scale.ordinal()
    .rangePoints([0, 360], 1)
    .domain(data_estados.map(function(d) { return d.UF; }));

d3line2 = d3.svg.line()
    .x(function(d){return d.x;})
    .y(function(d){return d.y;})
    .interpolate('linear'); 

// VIS EVENTOS

var App = {

    bipart: null,
    nodes_uf: null,
    nodes_force: null,
    force: null,
    node: null,
    timerange: null,

    current_date: null,

    init: function() {

        App.buildStatesRadial();
        App.buildForceGraph();
        App.buildBipartite();

        timeline = timeline.sort();
        console.log(timeline);

        App.timerange = $('#vis-time-range');
        App.timerange.attr('max',timeline.length-1);
        App.timerange.on('change input', function(e) {
            var current = parseInt(this.value);
            var format = locale.timeFormat('%d de %B de %Y');
            $('#vis-time-date').text(format(new Date(timeline[current])));
            // save timestamp and render force
            App.current_date = timeline[current];
            App.renderForceNodes(App.filterEventsBefore(App.current_date));
            //App.renderBipartiteRegions();
        })
        .change();

    },

    filterEventsBefore: function(timestamp){
        return _.filter(data_eventos,function(d){
            return +d.DATA <= timestamp;
        });
    },

    buildStatesRadial: function(){

        App.nodes_uf = vis.append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
        .append('g')
        .attr('class', 'nodes_uf')
        .selectAll('g')
        .data(data_estados.filter(function(d){
                return d.REGIAO !== null;
            }))
        .enter().append('g')
            .attr('data-uf', function(d) { return d.UF; })
            .attr('transform', function(d) { return 'rotate(' + (angle(d.UF)+angle_offset) + ')translate(' + radius + ',0)'; })
            .on('mouseover', function(d){
                App.events.mouseover_UF(d);
            })
            .on('mouseout', function(d){
                App.events.mouseout_UF(d);
            });

        App.nodes_uf.append('path')
            .attr('d', function(d){return d3line2([{x: 0, y: 0},{x: -10,y:0}]);})
            .attr('class', 'UF-path')
            .style('stroke-width',2)
            .style('stroke','#999')
            .style('fill','none');

        App.nodes_uf.append('text')
            .attr('class', 'UF-text')
            .attr('dy', '.35em')
            .attr('x', -12)
            .attr('y', 16)
            .attr('fill','#999')
            .text(function(d) { return d.UF; })
            .attr('transform', 'rotate(-90)')
            .filter(function(d) { return (20+angle(d.UF)) % 360 > 180; }) // flipped
                .attr('transform', 'rotate(90)')
                .attr('x', 12)
                .attr('y', -16)
            .style('text-anchor', 'end');
    },

    buildBipartite: function(){
        App.bipart = vis.append('g')
            .attr('transform', 'translate(' + (width / 2 - 100) + ',' + (height / 2 - 50) + ')')
            .append('g')
            .attr('class', 'bipart');

        App.bipart_title = App.bipart.append('text');

        App.bipart_title
            .attr("x", 100)
            .attr("y", -20)
            .style("fill","#999")
            .attr("text-anchor", "middle")
            ;
    },

    renderBipartiteState: function(UF){
        var table_count = [];
        var table_links = [];
        var data = App.filterEventsBefore(App.current_date);
        data_candidatos.map(function(c,i){
            var count = [c, _.where(data,{CANDIDATO: c, UF: UF}).length];
            if(count[1] > 0){
                table_count.push(count);
            }
            data_regioes.map(function(r,j){
                var links = [c, r, _.where(data,{CANDIDATO: c, REGIAO: r}).length];
                if(links[2] > 0){
                    table_links.push(links);
                }
            });
        });
        //console.log(table_count, table_links);
        App.renderBipartite(_.findWhere(data_estados,{UF: UF}).NOME,table_count,table_links);
    },

    renderBipartiteRegions: function(){
        
    },

    renderBipartiteNone: function(){
        App.renderBipartite("",[],[]);
    },

    renderBipartite: function(title,table_count, table_links){

        //var q = d3.scale.quantize().domain([0, table_count.length-1]).range(table_count.map(function(d){return d[0];}));

        var bar_cand,
            bar_other,
            sum = d3.sum(table_count,function(d){return d[1];})
            y_scale = d3.scale.linear().range([0,100]).domain([0, sum]),
            y_offset = 0,
            ;

        // ordem decrescente

        table_count.sort(function(a,b){
            return a[1] <= b[1];
        });

        // muda titulo

        App.bipart_title.text(title);

        // update dos dados

        bar_cand = App.bipart.selectAll('.bar_cand')
            .data(table_count, function(d){ return d[0];});

        // enter

        bar_cand.enter()
            .append("g").attr("class","bar_cand");

        // exit

        bar_cand.exit()
            .remove();
            // transition child before remove parent
            /*.selectAll('rect')
            .transition()
            .attr("height", 0)
            .attr("y", 0)
            .each('end', function () {
                d3.select(this.parentNode)
                .remove();
            });*/
        
        // appends

        bar_cand
                .append('rect')
                .attr("class", "rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 20)
                .attr("height", 0)
                .style("fill", function(d){return App.color(d[0])})
                ;

        bar_cand
                .append('text')
                .attr("class", "label")
                .attr("x", -10)
                .attr("y", 0)
                .attr("opacity", 0)
                .text(function(d){return d[0].split(" ")[0] + "  (" + d[1] + ")";})
                .style('text-anchor', 'end')
                .style("fill", function(d){return App.color(d[0])})
                ;

        // transitions (update)
        
        App.bipart
            .selectAll('.rect')
            .data(table_count, function(d){ return d[0];})
            .transition().duration(600)     
                .attr("height",function(d){ return y_scale(d[1]); })
                .attr("y", function(d){ var y = y_offset; y_offset += y_scale(d[1]); return y;})
                ;

        y_offset = 0;

        App.bipart
            .selectAll('.label')
            .data(table_count, function(d){ return d[0];})
            .transition().duration(600)
                .attr("font-size", 12)
                .attr("opacity", 1)
                .attr("y", function(d){ var y = y_offset; y_offset += y_scale(d[1]); return y + y_scale(d[1]) * 0.5 + 6;})
                ;
            
    },

    buildForceGraph: function(){

        data_estados.map(function(d){
            var a = (180 + angle_offset + angle(d.UF)) / 180 * Math.PI,
                x = width * 0.5 - Math.cos(a) * force_radius,
                y = height * 0.5 - Math.sin(a) * force_radius;
            
            /*
            if(clusters[d.UF]){
                clusters[d.UF].x = x;
                clusters[d.UF].x = y;
            }
            */
            clusters[d.UF] = {x: x, y: y, radius: 50};
        });

        App.nodes_force = vis.append('g').attr('class', 'nodes_force');

        App.node = App.nodes_force.selectAll('circle.node');

        App.force = d3.layout.force()
            .nodes(data_eventos)
            .size([width, height])
            .gravity(0.01)
            .charge(0)
            .on('tick', App.tick)
            .start();
        
        wrapper.on('mousemove', function() {
            //var p1 = d3.mouse(this);
            //root.px = p1[0];
            //root.py = p1[1];
            //App.force.resume();
        });

        console.log('FORCE!');
    },

    renderForceNodes: function(arr){

        App.node = App.node.data(arr, function(d){ return d.ID;});

        App.node.enter()
            .append('circle')
                .attr('r', 1)
                .style('fill', function(d) { return App.color(d.CANDIDATO); })
                .attr('class', 'node')
                .attr('data-uf', function(d) { return d.UF; })
                .attr('data-candidato', function(d) { return d.CANDIDATO.split(' ').join('_'); })
                .attr('cx', function(d){
                    var a = (180 + angle_offset + angle(d.UF)) / 180 * Math.PI,
                        x = width * 0.5 - Math.cos(a) * force_radius * 0.5;

                    d.px = d.x = x + Math.random() * 10;
                    return d.x;
                })
                .attr('cy', function(d){
                    var a = (180 + angle_offset + angle(d.UF)) / 180 * Math.PI,
                        y = height * 0.5 - Math.sin(a) * force_radius * 0.5;

                    d.py = d.y = y + Math.random() * 10;
                    return d.y;
                })
                .on('mouseover', function(d){
                    App.events.mouseover_node(d);
                })
                .on('mouseout', function(d){
                    App.events.mouseout_node(d);
                })
                .call(App.force.drag)
                .transition().duration(600)
                .attr('r', function(d) { return d.radius * d.scale; })
                ;
        App.node.exit()
            .transition()
            .attr('r', 0)
            .remove();
        
        App.force.resume();
    },

    tick: function(e){

        App.node
            .each(App.cluster(20 * e.alpha * e.alpha))
            .each(App.collide(0.5))
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
        
        //console.log('TICK!');

    },
    color: function(candidato){
        switch(candidato){
            case 'AÉCIO NEVES':
                return '#127bbf';
            case 'MARINA SILVA':
                return '#e8d354';
            case 'DILMA ROUSSEFF':
                return '#cc0000';
        }
    },
    cluster: function(alpha){
        return function(d) {
            var cluster = clusters[d.cluster];
            //alpha = 0.025;
            //console.log(alpha);
            if (cluster === d){
                return false;
            }
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius * d.scale + cluster.radius * 0.2;

            if (l !== r) {
                l = (l - r) / l * alpha * 0.1;
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
                .attr('r', function(d) { console.log(d.scale); return d.radius * d.scale; })
                ;
            App.force.resume();*/

            var vis = $('#vis-wrapper');
            var format = locale.timeFormat('(%d/%m)');
            $('#vis-tip .data').text(format(d.DATA));
            $('#vis-tip .local').text(d.MUNICIPIO + ' - ' + d.UF);
            $('#vis-tip .candidato').text(d.CANDIDATO).css('color',App.color(d.CANDIDATO));
            $('#vis-tip .categoria').text(d.CATEGORIA);
            $('#vis-tip .atividade').text(d.ATIVIDADE);
            /*$('#vis-tip').css({
                left: vis.offset().left + width * 0.5,
                top: vis.offset().top + height * 0.5
            });*/
            App.events.ligaUF(d);
        },
        mouseout_node: function(d){
            /*_.findWhere(data_eventos,{ID: d.ID}).scale = 1;
            App.node
                .data(data_eventos, function(d){ return d.ID;})
                .transition()
                .attr('r', function(d) { console.log(d.scale); return d.radius * d.scale; })
                ;
            App.force.resume();*/
            $('#vis-tip .string').text('');
            App.events.desligaUF(d);
        },
        mouseover_UF: function(d){
            d3.selectAll('.node:not([data-uf='+d.UF+'])')
                .transition().duration(300)
                .style('opacity', 0.1);
            App.events.ligaUF(d);
            App.renderBipartiteState(d.UF);
        },
        mouseout_UF: function(d){
            d3.selectAll('.node:not([data-uf='+d.UF+'])')
                .transition().duration(300)
                .style('opacity',1);
            App.events.desligaUF(d);
            App.renderBipartiteNone();
        },
        ligaUF: function(d){
            d3.selectAll('[data-uf='+d.UF+'] .UF-text')
                .transition().duration(300)
                .attr('fill','#333');
            d3.selectAll('[data-uf='+d.UF+'] .UF-path')
                .transition().duration(300)
                .style('stroke','#333');
        },
        desligaUF: function(d){
            d3.selectAll('[data-uf='+d.UF+'] .UF-text')
                .transition().duration(300)
                .attr('fill','#999');
            d3.selectAll('[data-uf='+d.UF+'] .UF-path')
                .transition().duration(300)
                .style('stroke','#999');
        }
    }
};

// CARREGA DATASET E INICIA


loadDataset([
    'datasets/dados_aecioneves.csv',
    'datasets/dados_dilmarousseff.csv',
    'datasets/dados_marinasilva.csv'
], App.init);

