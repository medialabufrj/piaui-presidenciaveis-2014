// CONSTANTES

var App,
    RangeTimeline,
    width = 600,
    real_height = 660,
    height = 720,
    radius = 270,
    force_radius = 250,
    timeline = [],
    angle_offset = 18
    ;

// DATA

var data_regioes    = ['Norte','Nordeste','Centro-oeste','Sudeste','Sul'],
    data_estados    = [
        
        {UF: 'ES', REGIAO: 3, NOME: 'Espírito Santo', CAPITAL: 'Vitória'},
        {UF: 'MG', REGIAO: 3, NOME: 'Minas Gerais',   CAPITAL: 'Belo Horizonte'},
        {UF: 'RJ', REGIAO: 3, NOME: 'Rio de Janeiro', CAPITAL: 'Rio de Janeiro'},
        {UF: 'SP', REGIAO: 3, NOME: 'São Paulo',      CAPITAL: 'São Paulo'},

        {UF: 'NULL7', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL12', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL8', REGIAO: null, NOME: null, CAPITAL: null},
        
        {UF: 'PR', REGIAO: 4, NOME: 'Paraná',            CAPITAL: 'Curitiba'},
        {UF: 'SC', REGIAO: 4, NOME: 'Santa Catarina',    CAPITAL: 'Florianópolis'},
        {UF: 'RS', REGIAO: 4, NOME: 'Rio Grande do Sul', CAPITAL: 'Porto Alegre'},

        {UF: 'NULL9', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL10', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL11', REGIAO: null, NOME: null, CAPITAL: null},

        {UF: 'MS', REGIAO: 2, NOME: 'Mato Grosso do Sul', CAPITAL: 'Campo Grande'},
        {UF: 'GO', REGIAO: 2, NOME: 'Goiás',              CAPITAL: 'Goiânia'},
        {UF: 'DF', REGIAO: 2, NOME: 'Distrito Federal',   CAPITAL: 'Brasília'},
        {UF: 'MT', REGIAO: 2, NOME: 'Mato Grosso',        CAPITAL: 'Cuiaba'},
        

        {UF: 'NULL5', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL6', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL7', REGIAO: null, NOME: null, CAPITAL: null},

        
        {UF: 'AC', REGIAO: 0, NOME: 'Acre',      CAPITAL: 'Rio Branco'},
        {UF: 'AM', REGIAO: 0, NOME: 'Amazonas',  CAPITAL: 'Manaus'},
        {UF: 'RO', REGIAO: 0, NOME: 'Rondônia',  CAPITAL: 'Porto Velho'},
        {UF: 'RR', REGIAO: 0, NOME: 'Roraima',   CAPITAL: 'Boa Vista'},
        {UF: 'PA', REGIAO: 0, NOME: 'Pará',      CAPITAL: 'Belém'},
        {UF: 'AP', REGIAO: 0, NOME: 'Amapá',     CAPITAL: 'Macapá'},
        {UF: 'TO', REGIAO: 0, NOME: 'Tocantins', CAPITAL: 'Palmas'},


        {UF: 'NULL1', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'EUA', REGIAO: null, NOME: null, CAPITAL: 'Nova York'},
        {UF: 'NULL3', REGIAO: null, NOME: null, CAPITAL: null},

        {UF: 'MA', REGIAO: 1, NOME: 'Maranhão',            CAPITAL: 'São Luis'},
        {UF: 'PI', REGIAO: 1, NOME: 'Piauí',               CAPITAL: 'Teresina'},
        {UF: 'CE', REGIAO: 1, NOME: 'Ceará',               CAPITAL: 'Fortaleza'},    
        {UF: 'RN', REGIAO: 1, NOME: 'Rio Grande do Norte', CAPITAL: 'Natal'},
        {UF: 'PB', REGIAO: 1, NOME: 'Paraíba',             CAPITAL: 'João Pessoa'},
        {UF: 'PE', REGIAO: 1, NOME: 'Pernambuco',          CAPITAL: 'Recife'},
        {UF: 'AL', REGIAO: 1, NOME: 'Alagoas',             CAPITAL: 'Maceió'},
        {UF: 'SE', REGIAO: 1, NOME: 'Sergipe',             CAPITAL: 'Aracaju'},
        {UF: 'BA', REGIAO: 1, NOME: 'Bahia',               CAPITAL: 'Salvador'},
        
        {UF: 'NULL8', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL2', REGIAO: null, NOME: null, CAPITAL: null},
        {UF: 'NULL4', REGIAO: null, NOME: null, CAPITAL: null}
        
    ],
    data_candidatos = [],
    data_candidatos_filter = [],
    data_eventos    = [],
    data_categorias = [],
    data_categorias_filter = [],
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

            if(timeline.indexOf(unixtime) === -1){
                timeline.push(unixtime);
            }

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
            // chama callback
            if(callback){
                callback(id);
            }
        });
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
    .attr('height', real_height)
    .append('g')
    //.call(zoom)
    ;

rect = wrapper.append('rect')
    .attr('width', width)
    .attr('height', real_height)
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

// TIMELINE RANGE D3

RangeTimeline = {

    init: function(){

        var _this = this;

        // drag behavior

        this.drag = d3.behavior.drag()
            //.origin(function(d) { return d; })
            .on('drag',this.onDrag)
            .on('dragstart',this.onDrag)
            //.on('dragend',this.updateSlider)
            ;

        // svg

        this.wrapper = d3.select('#timeline-d3').append('svg')
            .attr('class','range-timeline')
            .attr('width', width)
            .attr('height', 80)
            ;

        // date display

        this.datedisplay = this.wrapper.append('text')
            .attr('class', 'datedisplay')
            .text('')
            .attr('x',0)
            .attr('y',20)
            ;

        // slider

        this.slider = this.wrapper.append('g')
            .data([{ x: 50, y: 50 }])
            .attr('class', 'slider')
            .attr('transform', 'translate(0 30)')
            .call(this.drag)
            ;

        // slider bg

        this.base = this.slider.append('rect')
            .attr('class', 'range-base')
            .attr('width', width-20)
            .attr('height', 32)
            .attr('y', 10)
            .attr('x', 20)
            .attr('rx', 16)
            .attr('ry', 16)
            .attr('fill', '#eee')
            ;
        
        // slider range

        this.range = this.slider.append('rect')
            .attr('class', 'range')
            .attr('width', 60)
            .attr('height', 32)
            .attr('y', 10)
            .attr('x', 20)
            .attr('rx', 15)
            .attr('ry', 15)
            .attr('fill', '#999')
            ;

        // slider circle

        this.circle = this.slider.append('circle')
            .attr('class', 'range-circle')
            .attr('r', 8)
            .attr('cy', 26)
            .attr('cx', 64)
            .attr('fill', '#fff')
            ;

        // play-pause button

        this.button = this.wrapper.append('g')
            .attr('class', 'play-button')
            .attr('transform', 'translate(0 30)')
            .on('click',function(){
                if(RangeTimeline.play_timeout){
                    RangeTimeline.clearPlay();
                }else{
                    RangeTimeline.play();
                }
            });

        this.button.append('circle')
            .attr('class', 'play-button-bg')
            .attr('r',20)
            .attr('cx',21)
            .attr('cy',25)
            .attr('fill','#fff')
            .attr('stroke','#999')
            .attr('stroke-width',2)
            ;

        this.button_icon_play = this.button.append('polygon')
            .attr('class', 'icon-play')
            .attr('points', '15,16 15,34 30,25')
            .attr('fill', '#999')
            ;

        this.button_icon_pause = this.button.append('g')
            .attr('class', 'icon-pause');

        this.button_icon_pause.append('rect')
            .attr('width', 4)
            .attr('height', 18)
            .attr('y', 16)
            .attr('x', 15)
            .attr('fill', '#999')
            ;
        this.button_icon_pause.append('rect')
            .attr('width', 4)
            .attr('height', 18)
            .attr('y', 16)
            .attr('x', 22)
            .attr('fill', '#999')
            ;

        // TOOLTIP

        this.tooltip = this.wrapper.append('g')
            .attr('class', 'tooltip')
            ;

        //this.tooltip.

        // UPDATE

        this.updateSliderStep(0);
        this.play();

        // LOAD MARCOS
        
        this.destaques_data = [];

        var dsv = d3.dsv(';', 'text/plain');

        dsv('./datasets/destaques.csv')
            .row(function(d){
                var format = d3.time.format('%d.%m.%Y');
                d.DATA_STRING = d.DATA;
                d.DATA = format.parse(d.DATA);
                d.TIMESTAMP = +d.DATA;
                return d;
            })
            .get(function(error, rows){
                _this.destaques_data = rows;
                _this.renderDestaques();
            });
    },

    renderDestaques: function(){

        var _this = this;

        this.destaques = this.slider.selectAll('.destaques').data(this.destaques_data);
        this.destaques
            .enter().append('circle')
            .attr('class','destaques')
            .attr('r',0)
            .attr('cy',26)
            .attr('cx',function(d){
                var stepW = (width-20-60)/(timeline.length-1);
                return 64 + timeline.indexOf(d.TIMESTAMP) * stepW;
            })
            .attr('fill',function(d){return App.color(d.CANDIDATO);})
            .on("mouseover", function(d){_this.showtooltip(d);})
            .on("mouseout", function(d){_this.hidetooltip(d);})
            .transition(300)
            .attr('r',5)
            ;
    },

    showtooltip: function(d){
        this.updatetooltip([d]);
    },

    hidetooltip: function(d){
        this.updatetooltip([]);
    },

    updatetooltip: function(data){

        var text = this.tooltip.selectAll('.text').data(data);
        var rect = this.tooltip.selectAll('.rect').data(data);
        var seta = this.tooltip.selectAll('.seta').data(data);
        
        this.tooltip.data(data)
            .attr('transform',function(d){
                var stepW = (width-20-60)/(timeline.length-1);
                var x = 64 + timeline.indexOf(d.TIMESTAMP) * stepW;
                return 'translate(' + x + ' 10)';
            })
            .attr('opacity',0)
            .transition(300)
            .attr('opacity',1)
            .attr('transform',function(d){
                var stepW = (width-20-60)/(timeline.length-1);
                var x = 64 + timeline.indexOf(d.TIMESTAMP) * stepW;
                return 'translate(' + x + ' 6)';
            });

        rect
            .enter()
            .append('rect')
            .attr('class','rect')
            .attr('width', function(d){
                return (d.TEXTO.length + 5)*6;
            })
            .attr('height', 24)
            .attr('y', 6)
            .attr('x', function(d){
                return -(d.TEXTO.length + 5)*3;
            })
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill',function(d){return App.color(d.CANDIDATO);})
            ;

        seta
            .enter()
            .append('polygon')
            .attr('class','seta')
            .attr('points', '-10,28 0,36 10,28')
            .attr('fill',function(d){return App.color(d.CANDIDATO);})
            ;

        text
            .enter()
            .append('text')
            .attr('class','text')
            .attr('font-size',11)
            .attr('fill','#fff')
            .style('text-anchor', 'middle')
            .text(function(d){
                var format = locale.timeFormat('%d/%m - ');
                var data = format(d.DATA);
                return data + d.TEXTO;
            })
            .attr('x',0)
            .attr('y',22)
            ;

        text.exit()
            .remove();

        rect.exit()
            .remove();

        seta.exit()
            .remove();
    },

    onDrag: function(){

        var x = d3.event.x || d3.event.sourceEvent.layerX;

        RangeTimeline.updateSlider(x);
        RangeTimeline.clearPlay();
    },

    updateSliderStep: function(current){

        var format = locale.timeFormat('%d de %B de %Y');
        var stepW = (width-20-60)/(timeline.length-1);
        var other_x = 60 + current * stepW;

        this.range.attr('width', other_x);
        this.circle.attr('cx', 20 + other_x - 16);
        
        //$('#vis-time-date .data').text(format(new Date(timeline[current])));
        this.datedisplay.text(format(new Date(timeline[current])));
        
        this.current = current;

        App.current_date = timeline[current];
        App.renderAll();
    },

    updateSlider: function(x){
        x = Math.min(width-20,Math.max(60,x));
        var perc = (x-60)/(width-20-60);
        var current = parseInt(perc*(timeline.length-1));
        RangeTimeline.updateSliderStep(current);
    },

    clearPlay: function(){
        if(RangeTimeline.play_timeout){
            clearTimeout(RangeTimeline.play_timeout);
            RangeTimeline.play_timeout = null;
        }
        this.button.classed('play',false);
    },

    play: function(reset){

        RangeTimeline.clearPlay();

        if(reset || RangeTimeline.current === timeline.length - 1){
            App.timestamp = App.current_date = timeline[0];
            RangeTimeline.updateSlider(0);
        }    

        var time = App.mode === 'Agenda' ? 300 : 2000;
        var tick = function(){
            if(RangeTimeline.current < timeline.length - 1){
                RangeTimeline.updateSliderStep(RangeTimeline.current+1);
                RangeTimeline.play_timeout = setTimeout(tick,time);
            } else {
                RangeTimeline.clearPlay();
            }
            
        };

        App.play_timeout = setTimeout(tick,300);
        this.button.classed('play',true);
    },
};


// VIS EVENTOS

App = {

    bipart: null,
    nodes_uf: null,
    nodes_force: null,
    force: null,
    node: null,
    timerange: null,
    timestamp: null,
    mode: 'Agenda',
    active_uf: null,
    current_date: null,

    init: function() {

        App.buildStatesRadial();
        App.buildForceGraph();
        App.buildBipartite();
        App.buildTravel();
        App.buildInfoUF();

        React.renderComponent(
            new SimpleRadio({
                title: 'Visualizar',
                data: ['Agenda','Trajetória'],
                savestate: App.reactChangeMode
            }), document.getElementById('vis-filter-vis')
        );

        React.renderComponent(
            new SimpleFilter({
                title: 'Candidatos',
                data: data_candidatos,
                savestate: App.reactFilterPeople
            }), document.getElementById('vis-filter-candidatos')
        );

        React.renderComponent(
            new SimpleFilter({
                title: 'Filtrar agenda',
                data: data_categorias.sort(),
                cols: 2,
                savestate: App.reactFilterCats
            }), document.getElementById('vis-filter-categorias')
        );

        timeline = timeline.sort();
        
        App.timestamp = timeline[0];

        RangeTimeline.init();

        $('#vis-label-ext').text('exterior');

    },

    filterEventsBefore: function(timestamp){
        return _.filter(data_eventos,function(d){
            return +d.DATA <= timestamp;
        });
    },

    filterByPeople: function(arr){
        return _.filter(arr,function(d){
            var filter = _.find(data_candidatos_filter,{id: d.CANDIDATO});
            return filter ? filter.selected : 1;
        });
    },

    filterByCats: function(arr){
        return _.filter(arr,function(d){
            var filter = _.find(data_categorias_filter,{id: d.CATEGORIA});
            return filter ? filter.selected : 1;
        });
    },

    reactFilterPeople: function(arr){
        data_candidatos_filter = arr;
        App.renderAll();
    },

    reactFilterCats: function(arr){
        data_categorias_filter = arr;
        App.renderAll();  
    },

    reactChangeMode: function(data){
        var id = _.findWhere(data,{selected: true}).id;
        if(App.mode !== id){
            App.mode = id;
            $('body').attr('data-mode',id);
            RangeTimeline.play(true);
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
                return y;
            });
    },

    buildInfoUF: function(){
        App.vis_infouf = vis.append('g')
            .attr('transform', 'translate(' + (width / 2 - 80) + ',' + (height / 2 - 75) + ')')
            .append('g')
            .attr('class', 'infouf');

        App.vis_infouf_title = App.vis_infouf.append('text');

        App.vis_infouf_title
            .attr('x', 0)
            .attr('y', -20)
            .style('fill','#999')
            //.attr('text-anchor', 'middle')
            ;
    },

    renderInfoUF: function(UF,data_array){

        var cand_offset = 50;
        var table_count = [];
        var data = data_array ? data_array : App.filterByCats(App.filterByPeople(App.filterEventsBefore(App.current_date)));
        var estado = _.findWhere(data_estados,{UF:UF});

        if(estado){
            App.vis_infouf_title.text(estado.NOME);
        }else{
            App.vis_infouf_title.text('');
        }

        data_candidatos.map(function(c){
            var count = [c, _.where(data,{CANDIDATO: c, UF: UF}).length];
            if(count[1] > 0){
                table_count.push(count);
            }
        });

        table_count.sort(function(a,b){
            if(a[1]!==b[1]){
                return a[1] <= b[1];    
            }
            var A = a[0].toLowerCase();
            var B = b[0].toLowerCase();
            if (A < B){
                return -1;
            }else if (A > B){
                return  1;
            }else{
                return 0;
            }
        }).map(function(d,i){
            return d.push(i);
        });

        var cand_name = App.vis_infouf.selectAll('.cand-name')
            .data(table_count,function(d){return d[0];})
            ;

        cand_name
            .enter()
            .append('text')
            .attr('class','cand-name')
            .text(function(d){return App.realname(d[0]);})
            .attr('fill',function(d){return App.color(d[0]);})
            .attr('y',function(d){return 20 + d[2] * cand_offset;})
            .attr('x',40)
            ;

        var cand_placeholder = App.vis_infouf.selectAll('.cand-placeholder')
            .data(table_count,function(d){return d[0];})
            ;

        cand_placeholder
            .enter()
            .append('circle')
            .attr('class','cand-placeholder')
            .attr('fill',function(d){return App.color(d[0]);})
            .attr('r', 18)
            .attr('cy', function(d){return 20 + d[2] * cand_offset;})
            .attr('cx', 18)
            ;

        var cand_image = App.vis_infouf.selectAll('.cand-image')
            .data(table_count,function(d){return d[0];})
            ;

        cand_image
            .enter()
            .append('image')
            .attr('class','cand-image')
            .attr('y', function(d){return 4 + d[2] * cand_offset;})
            .attr('x', 2)
            .attr('width', 32)
            .attr('height', 32)
            .attr('xlink:href',function(d){return App.image(d[0]);})
            ;

        var cand_count = App.vis_infouf.selectAll('.cand-count')
            .data(table_count,function(d){return d[0];})
            ;

        cand_count
            .enter()
            .append('text')
            .attr('class','cand-count')
            .text(function(d){return d[1];})
            .attr('fill',function(d){return App.color(d[0]);})
            .attr('y',function(d){return 20 + 16 + d[2] * cand_offset;})
            .attr('x',45)
            .attr('font-size',12)
            .transition(600)
            .attr('x',function(d){return 45 + d[1] * 3;})
            ;

        var cand_count_bar = App.vis_infouf.selectAll('.cand-count-bar')
            .data(table_count,function(d){return d[0];})
            ;

        cand_count_bar
            .enter()
            .append('rect')
            .attr('class','cand-count-bar')
            .attr('fill',function(d){return App.color(d[0]);})
            .attr('x', 40)
            .attr('y',function(d){return 30 + d[2] * cand_offset;})
            .attr('width', 0)
            .attr('height', 5)
            .transition(600)
            .attr('width',function(d){return d[1] * 3;})
            ;

        cand_name.exit().remove();
        cand_placeholder.exit().remove();
        cand_image.exit().remove();
        cand_count.exit().remove();
        cand_count_bar.exit().remove();
        

        // update

        App.vis_infouf.selectAll('.cand-name')
            .transition(300)
            .attr('y',function(d){return 20 + d[2] * cand_offset;})
            ;

        App.vis_infouf.selectAll('.cand-placeholder')
            .transition(300)
            .attr('cy', function(d){return 20 + d[2] * cand_offset;})
            ;

        App.vis_infouf.selectAll('.cand-image')
            .transition(300)
            .attr('y', function(d){return 4 + d[2] * cand_offset;})
            ;

        App.vis_infouf.selectAll('.cand-count')
            .transition(300)
            .text(function(d){return d[1];})
            .attr('y',function(d){return 20 + 16 + d[2] * cand_offset;})
            .attr('x',function(d){return 45 + d[1] * 3;})
            ;

        App.vis_infouf.selectAll('.cand-count-bar')
            .transition(300)
            .attr('y',function(d){return 30 + d[2] * cand_offset;})
            .attr('width',function(d){return d[1] * 3;})
            ;
    },

    buildTravel: function(){

        var aday = 24*60*60*1000;
        var travels = {};
        var id = 0;

        data_candidatos.map(function(c){
            var lastobj = {DATA: null, UF: null};
            data_travel_circles.push({CANDIDATO: c, id: id, x: 0, y: 0});
            id++;
            if(!travels[c]){
                travels[c] = [];
            }
            _.filter(data_eventos, function(e){
                return e.CANDIDATO === c;
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
                        return e.DATA === t.DATA;
                    });

                    if(siblings.length > 1){

                        var index = _.indexOf(siblings, t);
                        var leng = siblings.length;
                        var begin = t.DATA + index * aday / leng;
                        var end = index < leng - 1 ? t.DATA + (index + 1) * aday / leng : travels[c][i+1].DATA;

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
    

        var travel_paths = App.travel_paths.selectAll('.travelpath')
            .data(App.filterByPeople(data_travel),function(d){ return d.id; });

        var travel_circles = App.travel_circles.selectAll('.travelcircle')
            .data(App.filterByPeople(data_travel_circles),function(d){ return d.id; });

        // ENTER

        
        travel_paths
            .enter()
                .append('path')
                .attr('class', 'travelpath')
                .attr('stroke', function(d){ return App.color(d.CANDIDATO);})
                .attr('stroke-width', 2)
                .attr('opacity', 0)
                .attr('fill', 'none')
                .attr('d', function(d){
                    // TIP: FIREFOX COMPATIBILITY
                    // Writing your clean functions is better!
                    var p1 = [d.ax, d.ay].join(' ');
                    var p2_4 = [
                        [d.bx, d.by].join(' '),
                        [d.cx, d.cy].join(' '),
                        [d.dx, d.dy].join(' ')
                    ].join(', ');
                    return 'M' + p1 + ' C ' + p2_4;
                })
                ;

        

        travel_circles
            .enter()
            .append('circle')
            .attr('class', 'travelcircle')
            .attr('r', 5)
            .attr('fill',function(d){
                return App.color(d.CANDIDATO);
            });

        // REMOVE

        travel_paths
            .exit()
            .remove();

        travel_circles
            .exit()
            .remove();

        // UPDATE

        travel_paths
            .attr('opacity',function(d){
                if(+d.END <= +App.timestamp){
                    return 0.4;
                }
                if(+d.BEGIN > +App.timestamp){
                    return 0;
                }
                return 0.4;
            })
            .attr('stroke-dasharray', function(d){
                var res,
                    l = this.getTotalLength(),
                    i = d3.interpolateString('0,' + l, l + ',' + l);
                
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
            });
            

        travel_circles
            .attr('opacity',function(){
                return App.timestamp === timeline[0] || App.timestamp === timeline[timeline.length-1] ? 0 : 1;
            })
            .attr('cx',function(d){return d.x;})
            .attr('cy',function(d){return d.y;})
            ;
    },

    buildForceGraph: function(){

        data_estados.map(function(d){
            var r = d.REGIAO === null ? 340 : force_radius;
                r = d.UF === 'RJ' || d.UF === 'SP' || d.UF === 'MG' ? force_radius * 0.8 : r;
                r = d.UF === 'DF' ? force_radius * 0.9 : r;
            var a = (180 + angle_offset + angle(d.UF)) / 180 * Math.PI,
                x = width * 0.5 - Math.cos(a) * r,
                y = height * 0.5 - Math.sin(a) * r;

            clusters[d.UF] = {x: x, y: y, radius: 50};
        });

        App.nodes_force = vis.append('g').attr('class', 'nodes_force');

        App.node = App.nodes_force.selectAll('circle.node');

        App.force = d3.layout.force()
            .nodes(data_eventos)
            .size([width, height])
            .gravity(0.01)
            .charge(0)
            .friction(0.8)
            .on('tick', App.tick)
            .start();
        
    },

    renderAll: function(){
        if(App.mode === 'Agenda'){
            App.renderForceNodesFiltered();
            TweenLite.killTweensOf(App);
            App.unrenderTravel();
            if(App.active_uf !== null){
                App.events.mouseover_UF(App.active_uf);
            }
        } else {
            App.__renderForceNodes([]);
            
            TweenLite.to(App, 2, {
                    timestamp: App.current_date,
                    roundProps:'timestamp',
                    ease: Linear.easeNone,
                    onUpdate: function(){
                        //$('#vis-time-date .timestamp').text(App.timestamp);
                        App.renderTravel();
                    }
                });
            
        }
    },

    renderForceNodesFiltered: function(){
        var arr = App.filterEventsBefore(App.current_date);
        arr = App.filterByPeople(arr);
        arr = App.filterByCats(arr);
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
                        x = width * 0.5 - Math.cos(a) * force_radius * 1.3;

                    d.px = d.x = x + Math.random() * 10;
                    return d.x;
                })
                .attr('cy', function(d){
                    var a = (180 + angle_offset + angle(d.UF)) / 180 * Math.PI,
                        y = height * 0.5 - Math.sin(a) * force_radius * 1.3;

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
    realname: function(candidato){
        switch(candidato){
            case 'AÉCIO NEVES':
                return 'Aécio Neves';
            case 'MARINA SILVA':
                return 'Marina Silva';
            case 'DILMA ROUSSEFF':
                return 'Dilma Rousseff';
        }
    },
    cluster: function(alpha){
        return function(d) {
            var cluster = clusters[d.cluster];
            alpha = Math.max(0.1,alpha);
            if (cluster === d){
                return false;
            }
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius * d.scale + cluster.radius * 0.2;

            if (l !== r) {
                l = (l - r) / l * alpha * 0.05;
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
            clusterPadding = 16,
            maxRadius = 20;
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
        var a = (data_candidatos.indexOf(CANDIDATO) * 1.5 + timeline.indexOf(DATA)/timeline.length * 1.5 - 1.5  + 180 + angle_offset + angle(UF)) / 180 * Math.PI;
        if(UF === 'EUA'){
            radius *= 1.2;
        }
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
                .attr('r', function(d) { return d.radius * d.scale; })
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
                .attr('r', function(d) { return d.radius * d.scale; })
                ;
            App.force.resume();*/
            $('#vis-tip .string').text('');
            App.events.desligaUF(d);
        },
        mouseover_UF: function(d){
            if(App.mode !== 'Agenda'){
                return false;
            }
            App.active_uf = d;
            var nodes = d3.selectAll('.node[data-uf='+d.UF+']');
            d3.selectAll('.node:not([data-uf='+d.UF+'])')
                .transition().duration(300)
                .attr('r', function(n) { return n.radius * n.scale; })
                .style('opacity', 0.1);
            App.events.ligaUF(d);
            if(!nodes[0].length){
                return false;
            }
            //App.renderBipartiteState(d.UF);
            App.renderInfoUF(d.UF);
            
        },
        mouseout_UF: function(d){
            App.active_uf = null;
            d3.selectAll('.node:not([data-uf='+d.UF+'])')
                .transition().duration(300)
                .attr('r', function(n) { return n.radius * n.scale; })
                .style('opacity',1);
            App.events.desligaUF(d);
            //App.renderBipartiteNone();
            App.renderInfoUF(null,[]);
        },
        ligaUF: function(d){
            d3.selectAll('.nodes_uf [data-uf='+d.UF+'] .UF-text')
                .transition().duration(300)
                .attr('fill','#333');
            d3.selectAll('.nodes_uf :not([data-uf='+d.UF+']) .UF-text')
                .transition().duration(300)
                .attr('fill','#ddd');
        },
        desligaUF: function(){
            d3.selectAll('.nodes_uf .UF-text')
                .transition().duration(300)
                .attr('fill','#999');
        }
    }
};

// CARREGA DATASET E INICIA


loadDataset([
    'datasets/dados_aecioneves.csv',
    'datasets/dados_dilmarousseff.csv',
    'datasets/dados_marinasilva.csv'
], App.init);

