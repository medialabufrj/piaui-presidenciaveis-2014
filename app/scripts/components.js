/** @jsx React.DOM */

var SimpleRadio = React.createClass({displayName: 'SimpleRadio',
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
                React.DOM.div(null, 
                    React.DOM.label(null, React.DOM.input({type: "radio", checked: d.selected, onChange: this.__changeSelection.bind(this, d.id)}), 
                    d.id), 
                    React.DOM.br(null)
                )
            );
        }.bind(this));
        return (
            React.DOM.form(null, 
                React.DOM.span({className: "title"}, this.props.title), 
                checks
            )
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

var SimpleFilter = React.createClass({displayName: 'SimpleFilter',
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
                React.DOM.div(null, 
                    React.DOM.label(null, React.DOM.input({type: "checkbox", checked: d.selected, onChange: this.__changeSelection.bind(this, d.id)}), 
                    d.id), 
                    React.DOM.br(null)
                )
            );
        }.bind(this));
        if(this.props.cols){
            var r = Math.round(checks.length / this.props.cols)
            checks = [
                React.DOM.div({className: "col"}, checks.splice(0,r)),
                React.DOM.div({className: "col"}, checks)
            ];
        }
        var model = (this.props.global) ?
            (React.DOM.form(null, 
                React.DOM.span({className: "title"}, this.props.title), 
                React.DOM.label(null, React.DOM.input({type: "checkbox", ref: "globalSelector", onChange: this.__changeAllChecks}), "Todos"), 
                React.DOM.br(null), 
                checks
            ))
            :
            (React.DOM.form(null, 
                React.DOM.span({className: "title"}, this.props.title), 
                checks
            ))
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