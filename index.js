// Include the cluster module
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {
    console.log("Master started.")
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;
//    cpuCount = (cpuCount > 4)? 4: cpuCount;
    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

// Code to run if we're in a worker process

} else {
    console.log("Slave started.")
    var app = require('./app');

}
// Listen for dying workers
cluster.on('exit', function (worker) {
    console.log('Worker ' + worker.id + ' died :(');
    cluster.fork();
});
