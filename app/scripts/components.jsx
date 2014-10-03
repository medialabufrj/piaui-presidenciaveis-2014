/** @jsx React.DOM */

var SimpleRadio = React.createClass({
    getInitialState: function() {
        return {
            data: this.props.data.map(function(d,i){
                return {id: d, selected: i === 0 };
            })
        };
    },
    componentDidMount: function(){
    },
    componentDidUpdate: function(){
        this.props.savestate(this.state.data);
    },
    render: function() {
        var checks = this.state.data.map(function(d) {
            return (
                <div>
                    <label><input type="radio" checked={d.selected} onChange={this.__changeSelection.bind(this, d.id)} />
                    {d.id}</label>
                    <br />
                </div>
            );
        }.bind(this));
        return (
            <form>
                <span className="title">{this.props.title}</span>
                {checks}
            </form>
        );
    },
    __changeSelection: function(id) {
        var state = this.state.data.map(function(d) {
            return {
                id: d.id,
                selected: (d.id === id ? true : false)
            };
        });
        this.setState({ data: state });
    }
});

var SimpleFilter = React.createClass({
    getInitialState: function() {
        return {
            data: this.props.data.map(function(d){
                return {id: d, selected: true };
            })
        };
    },
    componentDidMount: function(){
        if(this.refs.globalSelector){
            this.refs.globalSelector.getDOMNode().checked = true;
        }
    },
    componentDidUpdate: function(){
        this.props.savestate(this.state.data);
    },
    render: function() {
        
        var checks = this.state.data.map(function(d) {
            return (
                <div>
                    <label><input type="checkbox" checked={d.selected} onChange={this.__changeSelection.bind(this, d.id)} />
                    {d.id}</label>
                    <br />
                </div>
            );
        }.bind(this));
        if(this.props.cols){
            var r = Math.round(checks.length / this.props.cols)
            checks = [
                <div className="col">{checks.splice(0,r)}</div>,
                <div className="col">{checks}</div>
            ];
        }
        var model = (this.props.global) ?
            (<form>
                <span className="title">{this.props.title}</span>
                <label><input type="checkbox" ref="globalSelector" onChange={this.__changeAllChecks} />Todos</label>
                <br />
                {checks}
            </form>)
            :
            (<form>
                <span className="title">{this.props.title}</span>
                {checks}
            </form>)
            ;
        return model;
    },
    __changeSelection: function(id) {
        var state = this.state.data.map(function(d) {
            return {
                id: d.id,
                selected: (d.id === id ? !d.selected : d.selected)
            };
        });
        this.setState({ data: state });
    },
    __changeAllChecks: function() {
        var value = this.refs.globalSelector.getDOMNode().checked;
        var state = this.state.data.map(function(d) {
            return { id: d.id, selected: value };
        });
        this.setState({ data: state });
    }
});