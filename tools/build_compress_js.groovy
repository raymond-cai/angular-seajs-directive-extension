final String src = '../js/angular-pa-1.0.3.js'
def f = new File(src)

def nameLl = f.name.split(/\./).toList()
nameLl[-1] = 'min.js'
def dist = new File(f.parentFile, nameLl.join('.'))

def ant = new AntBuilder()
// uglify taskdef
ant.taskdef name: 'uglify', 
	classname: 'uglify.ant.UglifyTask'

// uglify min
ant.uglify verbose: 'true', maxLineLen: 20000, 
	output: dist.absolutePath, {
	sources dir: f.parentFile.absolutePath, {
		file name: f.name
	}
}