def ant = new AntBuilder()

ant.taskdef name: 'jshint', classname: 'com.philmander.jshint.JsHintAntTask'

ant.jshint dir: '../js', optionsFile: 'jshintrc.properties', {
	include name: 'angular-pa-1.0.3.js'
}