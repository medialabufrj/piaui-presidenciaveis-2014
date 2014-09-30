// CONSTANTES

var width = 600;
var height = 600;
var radius = 270;
var force_radius = 240;
var timeline_min = null;
var timeline_max = null;
var timeline = [];
var angle_offset = 18;

// DATA (II)

var data_estados = data_estados || [],
    data_regioes = data_regioes || [],
    data_candidatos = [],
    data_candidatos_filter = [],
    data_eventos    = [],
    data_categorias = [],
    data_travel = [],
    data_travel_circles = [],
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

            // CHECK DATA
            //console.log(d.CANDIDATO,unixtime,d.DATA);

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
    timestamp: null,
    play_timeout: null,
    mode: "Agenda",

    current_date: null,

    init: function() {

        App.buildStatesRadial();
        App.buildForceGraph();
        App.buildBipartite();
        App.buildTravel();

        timeline = timeline.sort();
        console.log(timeline);
        App.timestamp = timeline[0];
        App.timerange = $('#vis-time-range');
        App.timerange.attr('max',timeline.length-1);
        App.timerange.on('change input', function() {
            var current = parseInt(this.value);
            var format = locale.timeFormat('%d de %B de %Y');
            $('#vis-time-date .data').text(format(new Date(timeline[current])));
            // save timestamp and render force
            App.current_date = timeline[current];
            App.renderAll();
            //App.renderBipartiteRegions();
        })
        .on('input', function(){
            if(App.play_timeout){
                clearTimeout(App.play_timeout);
            }
        })
        .change();

        React.renderComponent(
            SimpleRadio({
                title: "Visualizar",
                data: ["Agenda","Trajetória"],
                savestate: App.reactChangeMode
            }), document.getElementById('vis-filter-vis')
        );

        React.renderComponent(
            SimpleFilter({
                title: "Candidatos",
                data: data_candidatos,
                savestate: App.reactFilterPeople
            }), document.getElementById('vis-filter-candidatos')
        );

        App.timeplay = $('#vis-time-play');
        App.timeplay.on('click',function(){App.play();});
        App.play();
    },

    play: function(reset){
        
        if(App.play_timeout){
            clearTimeout(App.play_timeout);
        }

        console.log(reset,App.timerange.val(),timeline.length - 1)
        if(reset || App.timerange.val() == timeline.length - 1){
            App.timestamp = App.current_date = timeline[0];
            App.timerange.val(App.timerange.attr('min')).change();
        }    

        var time = App.mode == "Agenda" ? 300 : 2000;
        var tick = function(){
            var val = +App.timerange.val();
            var step = +App.timerange.attr('step');
            var max = +App.timerange.attr('max');

            if(val < max){
                App.timerange.val(val+step).change();
                App.play_timeout = setTimeout(tick,time);
            } else {
                App.play_timeout = null;
            }
            
        };

        App.play_timeout = setTimeout(tick,300);
    },

    filterEventsBefore: function(timestamp){
        return _.filter(data_eventos,function(d){
            return +d.DATA <= timestamp;
        });
    },

    filterByPeople: function(arr){
        return _.filter(arr,function(d){
            //console.log(d.CANDIDATO)
            var filter = _.find(data_candidatos_filter,{id: d.CANDIDATO});
            return filter ? filter.selected : 1;
        });
    },

    reactFilterPeople: function(arr){
        console.log(arr);
        data_candidatos_filter = arr;
        App.renderAll();
    },

    reactChangeMode: function(data){
        var id = _.findWhere(data,{selected: true}).id;
        if(App.mode != id){
            App.mode = id;
            App.play(true);
        }
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

        /*App.nodes_uf.append('path')
            .attr('d', function(){return d3line2([{x: 0, y: 0},{x: -10,y:0}]);})
            .attr('class', 'UF-path')
            .style('stroke-width',2)
            .style('stroke','#999')
            .style('fill','none');*/

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
            .attr('transform', 'translate(' + (width / 2 - 50) + ',' + (height / 2 - 75) + ')')
            .append('g')
            .attr('class', 'bipart');

        App.bipart_title = App.bipart.append('text');

        App.bipart_title
            .attr('x', 50)
            .attr('y', -20)
            .style('fill','#999')
            .attr('text-anchor', 'middle')
            ;
    },

    renderBipartiteState: function(UF){
        var table_count = [];
        var table_links = [];
        var data = App.filterEventsBefore(App.current_date);
        data_candidatos.map(function(c){
            var count = [c, _.where(data,{CANDIDATO: c, UF: UF}).length];
            if(count[1] > 0){
                table_count.push(count);
            }
            data_categorias.map(function(r){
                var links = [c, r, _.where(data,{CANDIDATO: c, UF: UF, CATEGORIA: r}).length];
                if(links[2] > 0){
                    table_links.push(links);
                }
            });
        });
        //console.log(table_count, table_links);
        App.renderBipartite(_.findWhere(data_estados,{UF: UF}).NOME,table_count,table_links);
    },

    renderBipartiteRegions: function(){
        /*
            data_regioes.map(function(r,j){
                var links = [c, r, _.where(data,{CANDIDATO: c, REGIAO: r}).length];
                if(links[2] > 0){
                    table_links.push(links);
                }
            });
        */
    },

    renderBipartiteNone: function(){
        App.renderBipartite('',[],[]);
    },

    renderBipartite: function(title,table_count, table_links){

        //var q = d3.scale.quantize().domain([0, table_count.length-1]).range(table_count.map(function(d){return d[0];}));

        var bar_cand,
            bar_other,
            sum = d3.sum(table_count,function(d){return d[1];}),
            y_scale = d3.scale.linear().range([0,150]).domain([0, sum]),
            y_offset = 0,
            nest_links = null
            ;

        // ordem decrescente

        table_count.sort(function(a,b){
            return a[1] <= b[1];
        });

        nest_links = d3.nest()
            .key(function(d){return d[1];})
            .sortValues(function(a,b){
                return a[2] <= b[2];
            })
            .entries(table_links)
            ;

        nest_links
            .map(function(d){
                d.COUNT = d3.sum(d.values,function(d){return d[2];});
                return d;
            });

        nest_links
            .sort(function(a,b){
                return a.COUNT <= b.COUNT;
            });

        // muda titulo

        App.bipart_title.text(title);

        // update dos dados

        bar_cand = App.bipart.selectAll('.bar_cand')
            .data(table_count, function(d){ return d[0];});

        bar_other = App.bipart.selectAll('.bar_other')
            .data(nest_links, function(d){ return d.key;});

        // enter

        bar_cand.enter()
            .append('g').attr('class','bar_cand');

        bar_other.enter()
            .append('g').attr('class','bar_other');

        // exit

        bar_cand.exit()
            .remove();

        bar_other.exit()
            .remove();
            // transition child before remove parent
            /*.selectAll('rect')
            .transition()
            .attr('height', 0)
            .attr('y', 0)
            .each('end', function () {
                d3.select(this.parentNode)
                .remove();
            });*/
        
        // appends

        bar_cand
                .append('rect')
                .attr('class', 'rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 20)
                .attr('height', 0)
                .style('fill', function(d){return App.color(d[0]);})
                ;

        bar_cand
                .append('text')
                .attr('class', 'label')
                .attr('x', -10)
                .attr('y', 0)
                .attr('opacity', 0)
                .text(function(d){return d[0].split(' ')[0] + '  (' + d[1] + ')';})
                .style('text-anchor', 'end')
                .style('fill', function(d){return App.color(d[0]);})
                ;

        var rect_other = bar_other
                .append('g')
                .attr('class', 'rect_other')
                .attr('transform','translate(80,0) scale(1,0)')
                .attr('offset', 0)
                ;

        bar_other
                .append('text')
                .attr('class', 'label_other')
                .attr('x', 112)
                .attr('y', 0)
                .attr('opacity', 0)
                .text(function(d){return d.key;})
                .style('text-anchor', 'start')
                .style('fill', '#999')
                ;

        y_offset = 0;

        rect_other.selectAll('rect')
            .data(function(d){return d.values;})
            .enter().append('rect').attr('class', 'sub_rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 20)
            ;

        rect_other
            .append('rect')
            .attr('class', 'sub_rect_line')
            .attr('x', 21)
            .attr('y', 0)
            .attr('width', 2)
            .attr('height',function(d){ return Math.floor(y_scale(d.COUNT)); })
            .style('fill', '#ccc')
            ;


        // transitions (update)

        y_offset = 0;

        App.bipart
            .selectAll('.rect')
            .data(table_count, function(d){ return d[0];})
            .transition().duration(600)     
                .attr('height',function(d){ return Math.floor(y_scale(d[1])); })
                .attr('y', function(d,i){ var y = y_offset; y_offset += Math.floor(y_scale(d[1])); return y+i;})
                ;

        y_offset = 0;

        App.bipart
            .selectAll('.label')
            .data(table_count, function(d){ return d[0];})
            .transition().duration(600)
                .text(function(d){return d[0].split(' ')[0] + '  (' + d[1] + ')';})
                .attr('font-size', 12)
                .attr('opacity', 1)
                .attr('y', function(d,i){ var y = y_offset; y_offset += Math.floor(y_scale(d[1])); return y + Math.floor(y_scale(d[1]) * 0.5) + 5 + i;})
                ;
        
        y_offset = 0;

        App.bipart
            .selectAll('.rect_other')
            .data(nest_links, function(d){ return d.key;})
            .transition().duration(600)     
                .attr('transform', function(d,i){
                        var y = y_offset;
                        y_offset += Math.floor(y_scale(d.COUNT));
                        return 'translate(80,' + (y + i) + ')scale(1,1)';
                    })
                ;

        y_offset = 0;

        App.bipart
            .selectAll('.label_other')
            .data(nest_links, function(d){ return d.key;})
            .transition().duration(600)
                .attr('font-size', 12)
                .attr('opacity', function(d){ return y_scale(d.COUNT) > 8 ? 1 : 0;})
                .attr('y', function(d,i){ var y = y_offset; y_offset += Math.floor(y_scale(d.COUNT)); return y + Math.floor(y_scale(d.COUNT) * 0.5) + 5 + i;})
                ;

        y_offset = 0;

        rect_other.selectAll('rect')
            .data(function(d){return d.values;})
            .transition().duration(600)
            .attr('height', function(d){ return Math.floor(y_scale(d[2]));})
            .style('fill', function(d){ return App.color(d[0]);})
            .attr('y', function(d,i){
                if(i===0){
                    y_offset = 0;
                }
                var y = y_offset;
                y_offset += Math.floor(y_scale(d[2]));
                //console.log('TRANS',i,y, y_offset);
                return y;
            });
    },

    buildTravel: function(){

        var aday = 24*60*60*1000;
        var travels = {};
        var id = 0;

        data_candidatos.map(function(c){
            var lastobj = {DATA: null, UF: null};
            data_travel_circles.push({CANDIDATO: c, id: id, x: 0, y: 0});
            id++;
            if(travels[c] == null){
                travels[c] = [];
            }
            _.filter(data_eventos, function(e){
                return e.CANDIDATO == c;
            }).map(function(e){
                if(lastobj.UF !== e.UF){
                    lastobj = {DATA: +e.DATA, UF: e.UF};
                    travels[c].push(lastobj);
                }
            });
        });

        id = 0;

        data_candidatos.map(function(c){ 
            travels[c].map(function(t,i){
                if(i < travels[c].length - 1){
                    var coord1 = App.getCoord(t.DATA, t.UF, c, 270);
                    var coord4 = App.getCoord(travels[c][i+1].DATA, travels[c][i+1].UF, c, 270);
                    var dist = App.dist(coord1,coord4);
                    var coord2 = App.getCoord(t.DATA, t.UF, c, dist > 150 ? 100 : 100 + 100 / dist * 50);
                    var coord3 = App.getCoord(travels[c][i+1].DATA, travels[c][i+1].UF, c, dist > 150 ? 100 : 100 + 100 / dist * 50);

                    var siblings = _.filter(travels[c], function(e){
                        return e.DATA == t.DATA;
                    });

                    if(siblings.length > 1){

                        var index = _.indexOf(siblings, t);
                        var leng = siblings.length;
                        var begin = t.DATA + index * aday / leng;
                        var end = index < leng - 1
                            ? t.DATA + (index + 1) * aday / leng
                            : travels[c][i+1].DATA;

                        //console.log(c,t.UF,index,t.DATA,begin,end);

                        data_travel.push({
                            id: id,
                            CANDIDATO: c,
                            UF: t.UF,
                            DATA: t.DATA,
                            BEGIN: begin,
                            END: end,
                            ax: coord1.x, ay: coord1.y,
                            bx: coord2.x, by: coord2.y,
                            cx: coord3.x, cy: coord3.y,
                            dx: coord4.x, dy: coord4.y
                        });
                    } else {
                        data_travel.push({
                            id: id,
                            CANDIDATO: c,
                            UF: t.UF,
                            DATA: t.DATA,
                            BEGIN: t.DATA,
                            END: travels[c][i+1].DATA,
                            ax: coord1.x, ay: coord1.y,
                            bx: coord2.x, by: coord2.y,
                            cx: coord3.x, cy: coord3.y,
                            dx: coord4.x, dy: coord4.y
                        });
                    }
                    id++;
                }
            });
        });

        App.travel_paths = vis.append('g').attr('class', 'travel_paths');
        App.travel_circles = vis.append('g').attr('class', 'travel_circles');

    },

    unrenderTravel: function(){
        App.travel_paths.selectAll('.travelpath')
            .data([])
            .exit()
                .remove();
        App.travel_circles.selectAll('.travelcircle')
            .data([])
            .exit()
                .remove();
    },

    renderTravel: function(){

        var lineFunction = d3.svg.line()
            .interpolate('basis')
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });
            

        var travel_paths = App.travel_paths.selectAll('.travelpath')
            .data(App.filterByPeople(data_travel),function(d){ return d.id; });

        var travel_circles = App.travel_circles.selectAll('.travelcircle')
            .data(App.filterByPeople(data_travel_circles),function(d){ return d.id; });

        travel_paths
            .enter()
                .append('path')
                .attr('class', 'travelpath')
                .attr('stroke', function(d){ return App.color(d.CANDIDATO);})
                .attr('stroke-width', 2)
                .attr('opacity', 0)
                .attr('fill', "none")
                .attr('d', function(d){
                    return lineFunction([
                        {x: d.ax, y: d.ay},
                        {x: d.bx, y: d.by},
                        {x: d.cx, y: d.cy},
                        {x: d.dx, y: d.dy}
                        ]
                    );
                })
                ;

        travel_paths
            .exit()
                .remove();

        travel_circles
            .enter()
            .append('circle')
            .attr('class', 'travelcircle')
            .attr('r', 5)
            .attr('fill',function(d){
                return App.color(d.CANDIDATO);
            });

        travel_circles
            .exit()
            .remove();

        travel_paths
            //.transition(300)
            .attr('opacity',function(d){
                if(+d.END <= +App.timestamp){
                    return 0.4;
                }
                if(+d.BEGIN > +App.timestamp){
                    return 0;
                }
                return 0.4;
            })
            .attr("stroke-dasharray", function(d){
                var res,
                    l = this.getTotalLength(),
                    i = d3.interpolateString("0," + l, l + "," + l);

                if(d.END <= App.timestamp){
                    res = 1;
                } else if(d.BEGIN >= App.timestamp){
                    res = 0;
                } else {
                    res = (App.timestamp-d.BEGIN)/(d.END-d.BEGIN);
                    var p = this.getPointAtLength(res * l);
                    var c = _.findWhere(data_travel_circles,{CANDIDATO: d.CANDIDATO});
                    c.x = p.x;
                    c.y = p.y;
                }
                return i(res);
            })
            ;

        travel_circles
            .attr('cx',function(d){return d.x;})
            .attr('cy',function(d){return d.y;})
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

    renderAll: function(){
        if(App.mode == "Agenda"){
            App.renderForceNodesFiltered();
            TweenLite.killTweensOf(App);
            App.unrenderTravel();
        } else {
            App.__renderForceNodes([])
            TweenLite.to(App, 2, {timestamp: App.current_date, roundProps:"timestamp", ease: Linear.easeNone, onUpdate: function(){
                $('#vis-time-date .timestamp').text(App.timestamp);
                App.renderTravel();
            }});
        }
    },

    renderForceNodesFiltered: function(){
        var arr = App.filterEventsBefore(App.current_date);
        arr = App.filterByPeople(arr);
        App.__renderForceNodes(arr);
    },

    __renderForceNodes: function(arr){

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
                return '#437fb7';
            case 'MARINA SILVA':
                return '#e9ba00';
            case 'DILMA ROUSSEFF':
                return '#cc3a3a';
        }
    },
    image: function(candidato){
        switch(candidato){
            case 'AÉCIO NEVES':
                return './images/aecio.png';
            case 'MARINA SILVA':
                return './images/marina.png';
            case 'DILMA ROUSSEFF':
                return './images/dilma.png';
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

    dist: function(a,b){
        var x = a.x-b.x;
        var y = a.y-b.y;
        return Math.sqrt(x*x+y*y);
    },

    getCoord: function(DATA, UF, CANDIDATO, radius){
        //var a = (data_candidatos.indexOf(CANDIDATO) -1 + 180 + angle_offset + angle(UF)) / 180 * Math.PI;
        var a = (2 - timeline.indexOf(DATA)/timeline.length*4 + 180 + angle_offset + angle(UF)) / 180 * Math.PI;
        return {
            x: width * 0.5 - Math.cos(a) * radius,
            y: height * 0.5 - Math.sin(a) * radius
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

            //var vis = $('#vis-wrapper');
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
            var nodes = d3.selectAll('.node[data-uf='+d.UF+']');
            if(!nodes[0].length){
                return false;
            }
            d3.selectAll('.node:not([data-uf='+d.UF+'])')
                .transition().duration(300)
                .attr('r', function(d) { return d.radius * d.scale; })
                .style('opacity', 0.1);
            App.events.ligaUF(d);
            App.renderBipartiteState(d.UF);
        },
        mouseout_UF: function(d){
            d3.selectAll('.node:not([data-uf='+d.UF+'])')
                .transition().duration(300)
                .attr('r', function(d) { return d.radius * d.scale; })
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

