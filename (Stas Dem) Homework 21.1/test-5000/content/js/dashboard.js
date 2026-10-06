/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 7.702, "KoPercent": 92.298};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.075155, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.078175, 500, 1500, "DELETE Character"], "isController": false}, {"data": [0.066875, 500, 1500, "GET All Characters"], "isController": false}, {"data": [0.076125, 500, 1500, "GET Character By ID"], "isController": false}, {"data": [0.07695, 500, 1500, "POST Create Character"], "isController": false}, {"data": [0.07765, 500, 1500, "PUT Update Character"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 92298, 92.298, 6.430140000000044, 0, 1739, 0.0, 2.0, 8.0, 97.0, 36589.82802780827, 139657.2647960117, 463.52451518477864], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["DELETE Character", 20000, 18433, 92.165, 3.087049999999986, 0, 1660, 0.0, 1.0, 4.0, 74.0, 7421.150278293135, 16205.239375579778, 73.81652945269018], "isController": false}, {"data": ["GET All Characters", 20000, 18488, 92.44, 19.54940000000004, 0, 1739, 0.0, 2.0, 29.0, 907.0, 7317.965605561654, 75305.91954811562, 69.69504665203073], "isController": false}, {"data": ["GET Character By ID", 20000, 18475, 92.375, 3.3823999999999903, 0, 921, 0.0, 1.0, 5.0, 105.0, 7390.983000739098, 16175.897816772913, 71.54601464338508], "isController": false}, {"data": ["POST Create Character", 20000, 18457, 92.285, 3.0694000000000017, 0, 1260, 0.0, 1.0, 4.0, 72.0, 7396.449704142012, 16342.003455528846, 123.15486027644229], "isController": false}, {"data": ["PUT Update Character", 20000, 18445, 92.225, 3.062449999999996, 0, 1363, 0.0, 1.0, 4.0, 72.0, 7421.150278293135, 16414.972025742118, 130.16183035714286], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5311, 5.75418752302325, 5.311], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 64911, 70.32763440161217, 64.911], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 22076, 23.91817807536458, 22.076], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 92298, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 64911, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 22076, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5311, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["DELETE Character", 20000, 18433, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 12958, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 4246, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1229, "", "", "", ""], "isController": false}, {"data": ["GET All Characters", 20000, 18488, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 13104, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 4267, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1117, "", "", "", ""], "isController": false}, {"data": ["GET Character By ID", 20000, 18475, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 12964, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 4438, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1073, "", "", "", ""], "isController": false}, {"data": ["POST Create Character", 20000, 18457, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 13005, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 4470, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 982, "", "", "", ""], "isController": false}, {"data": ["PUT Update Character", 20000, 18445, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 12880, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 4655, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 910, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
