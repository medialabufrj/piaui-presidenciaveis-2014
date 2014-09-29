/** @jsx React.DOM */

var SimpleFilter = React.createClass({displayName: 'SimpleFilter',
    getInitialState: function() {
        return {
            data: this.props.data.map(function(d){
                return {id: d, selected: true };
            })
        };
    },
    componentDidMount: function(){
        this.refs.globalSelector.getDOMNode().checked = true;
    },
    componentDidUpdate: function(){
        this.props.savestate(this.state.data);
    },
    render: function() {
        var checks = this.state.data.map(function(d) {
            return (
                React.DOM.div(null, 
                    React.DOM.input({type: "checkbox", checked: d.selected, onChange: this.__changeSelection.bind(this, d.id)}), 
                    d.id, 
                    React.DOM.br(null)
                )
            );
        }.bind(this));
        return (
            React.DOM.form(null, 
                React.DOM.input({type: "checkbox", ref: "globalSelector", onChange: this.__changeAllChecks}), 
                React.DOM.label({className: "title"}, this.props.title), 
                React.DOM.br(null), 
                checks
            )
        );
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