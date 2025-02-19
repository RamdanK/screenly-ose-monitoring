/*
________________________________________
      Freebits Signage Monitor
________________________________________
*/

/**
 * set notifiaction parameter in localStorage
 * @method setNotification
 * @param  {[string]} style   set notification style
 * @param  {[string]} message set shown message
 */
function setNotification(style, message) {
	localStorage.setItem("notification_style", style);
	localStorage.setItem("notification_message", message);
	localStorage.setItem("notification_counter", "0");
}

/**
 * check URL and return GET parameter value
 * @method getUrlParameterByName
 * @param  {[string]} name name of the get parameter
 * @param  {[string]} url  url to check
 * @return {[type]}        value of the get parameter
 */
function getUrlParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Refresh the value of Device Info containers
 * @method loadDeviceInfo
 */
function loadDeviceInfo() {
	$('div.device-info').each(function(index, element) {
		var url = $(element).attr('data-src');
		$.ajax({
			url: 'assets/php/deviceInfo.php',
			data: {
				deviceInfo: 1,
				ip: url
			},
			type: 'GET',
			success: function(data) {
				if (userAddonActive === 0) $(element).hide();
				else {
					$(element).show();
					data = JSON.parse(data);
					$('span.cpu').text(data.cpu.value);
					$('span.cpu_frequency').text(data.cpu.frequency);
					$('div.cpu-bar').css('width', data.cpu.progress + '%').attr('aria-valuenow', data.cpu.progress).css('background-color', data.cpu.color);
					$('span.memory').text(data.memory.value);
					$('span.memory_total').text(data.memory.total);
					$('div.memory-bar').css('width', data.memory.progress + '%').attr('aria-valuenow', data.memory.progress).css('background-color', data.memory.color);
					$('span.temp').text(data.temp.value);
					$('div.temp-bar').css('width', data.temp.progress + '%').attr('aria-valuenow', data.temp.progress).css('background-color', data.temp.color);
					$('span.disk').text(data.disk.value);
					$('span.disk_total').text(data.disk.total);
					$('div.disk-bar').css('width', data.disk.progress + '%').attr('aria-valuenow', data.disk.progress).css('background-color', data.disk.color);
					$('span.hostname').text(data.hostname);
					$('span.platformName').text(data.platform.name);
					$('span.platformVersion').text(data.platform.version);
					$('span.versiondev').html(data.versiondev);
					$('span.versionmon').html(data.versionmon);
					$('span.versiondesc').html(data.versiondesc);
					$('span.uptime').text(data.uptime.stamp);
					$('span.upnow').text(data.uptime.now);
				}
			},
			error: function() {
				$(element).html("");
				console.log('No connection - ' + url);
			},
		});
	});
}

/**
 * Refresh player status image
 * @method reloadPlayerImage
 */
function reloadPlayerImage() {
	$('img.player').each(function(index, element) {
		var url = $(element).attr('data-src');
		var active = 1;
		if (userAddonActive === 0) active = 0;
		$.ajax({
			url: 'assets/php/image.php',
			data: {
				image: 1,
				ip: url,
				active: active
			},
			dataType: 'json',
			type: 'GET',
			success: function(data) {
				$(element).attr('src', data);
			},
			error: function() {
				$(element).attr('src', 'assets/img/offline.png');
				console.log('No connection - ' + url);
			},
		});
	});
}

/**
 * Refresh log output
 * @method loadLog
 * @param  {[string]} id ID of the player
 */
function loadLog(id) {
	$.ajax({
		url: 'assets/php/addon.php?load=log&playerID=' + id,
		type: 'GET',
		success: function(data) {
			$('.logOutput').html(data);
		},
	});
}

/**
 * flatpickr settings for asset modal
 */
flatpickr(".asset_start", {
	altInput: true,
	altFormat: "d.m.Y",
	dateFormat: "Y-m-d",
	defaultDate: $(this).data('start-date')
});

flatpickr(".asset_start_time", {
	enableTime: true,
	noCalendar: true,
	dateFormat: "H:i",
	time_24hr: true,
	defaultDate: $(this).data('start-time')
});

flatpickr(".asset_end", {
	altInput: true,
	altFormat: "d.m.Y",
	dateFormat: "Y-m-d",
	defaultDate: $(this).data('end-date')
});

flatpickr(".asset_end_time", {
	enableTime: true,
	noCalendar: true,
	dateFormat: "H:i",
	time_24hr: true,
	defaultDate: $(this).data('end-time')
});

/**
 * Refresh site on close modal
 */
$('.close_modal').on('hidden.bs.modal', function() {
	location.reload();
});

/**
 * Show/Hide div elements
 */
$(".toggle_div").change(function() {
	$($(this).data('src')).toggle();
});

/**
 * Set autofocus in modal input
 */
$('.modal').on('shown.bs.modal', function() {
	$(this).find('[autofocus]').focus();
});


/**
 * Set Asset status active/inactive
 */
$('.changeState').on('click', function() {
	var asset = $(this).data('asset_id');
	var id = getUrlParameterByName('playerID');
	var changeAssetState = 1;
	$.ajax({
		url: '_functions.php',
		type: 'POST',
		data: {
			asset: asset,
			id: id,
			changeAssetState: changeAssetState
		},
		success: function() {
			$('span[data-asset_id="' + asset + '"').toggle(function() {
				$(this).toggleClass('bg-success bg-danger').show();
				if ($(this).hasClass('bg-danger')) $(this).text('inactive');
				else $(this).text('active');
			});
			$('button[data-asset_id="' + asset + '"').toggle(function() {
				$(this).toggleClass('btn-info btn-cyan').show();
				if ($(this).hasClass('btn-cyan')) $(this).html('<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 4v16l13 -8z" /></svg>');
				else $(this).html('<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>');
			});
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: 'Asset status changed'
			}, {
				type: 'success',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
		},
		error: function() {
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: 'Error! - Can \'t change the Asset'
			}, {
				type: 'danger',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
		}
	});
});

/**
 * Active / Deactivte SOMA Tools
 */
$('input[name="addon_switch"]').on('change', function() {
	var id = $(this).data('id');
	var check = '0';
	if ($(this).is(':checked')) check = 'on';
	$.ajax({
		url: '_functions.php',
		type: 'POST',
		data: {
			addon_switch_form: '1',
			addon_switch_user: id,
			addon_switch: check
		},
		success: function() {
			location.reload(0);
		},
		error: function() {
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: 'Error! - Can \'t change Addon State'
			}, {
				type: 'danger',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
		}
	});
});

/**
 * Load next/previous asset
 */
$('.changeAsset').on('click', function() {
	var order = $(this).data('order');
	var id = getUrlParameterByName('playerID');
	var changeAsset = 1;
	$.ajax({
		url: '_functions.php',
		type: 'POST',
		data: {
			order: order,
			playerID: id,
			changeAsset: changeAsset
		},
		success: function(data) {
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: data
			}, {
				type: 'success',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
		},
		error: function() {
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: 'Error! - Can \'t change the Asset'
			}, {
				type: 'danger',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
		}
	});
});

var asset_table = $('#assets').DataTable({
	dom: 'tipr',
	orderFixed: [[4, playerAssetsOrder], [2, 'desc']],
	rowGroup: {
		dataSrc: 4,
	},
	ordering: true,
	responsive: {
		details: {
			type: 'column'
		}
	},
	columnDefs: [{
		className: 'control',
		orderable: false,
		targets: 0
  }],
	stateSave: true,
	autoWidth: false,
	initComplete: () => {
		$('.dataTables_paginate').appendTo('#dataTables_paginate');
		$('.dataTables_info').appendTo('#dataTables_info');
	},
	language: {
		url: "assets/php/datatable_lang.json.php"
	}
});

$('#assetSearch').keyup(function() {
	asset_table.search($(this).val()).draw();
});
$(document).ready(function() {
	$('#assetSearch').val(asset_table.search()).change;
});

$('#assetLength_change').val(asset_table.page.len());

$('#assetLength_change').change(function() {
	asset_table.page.len($(this).val()).draw();
});

$("#assets tbody").sortable({
	//placeholder: "ui-state-highlight",
	cursor: 'move',
	items: 'tr:not(.asset-hidden)',
	axis: 'y',
	helper: function(e, tr) {
		var $originals = tr.children();
		var $helper = tr.clone();
		$helper.children().each(function(index) {
			$(this).width($originals.eq(index).width());
		});
		return $helper;
	},
	update: function(event, ui) {
		var player = ui.item["0"].dataset.playerid;
		var data = $(this).sortable('serialize', {
			key: 'order[]',
			expression: /(.+)/
		});
		data += '&id=' + player;
		data += '&changeOrder=1';

		$.ajax({
			type: "POST",
			url: "_functions.php",
			data: data,
		});
	}
});

// New Asset
$('input:radio[name="add_asset_mode"]').click(function() {
	var inputValue = $(this).attr("value");
	var targetBox = $("." + inputValue);
	$(".tab").not(targetBox).hide();
	$(targetBox).show();
});

Dropzone.autoDiscover = false;
if ($('.drop').length) {
	var acceptedFileTypes = "image/*, video/*";
	var myDropzone = new Dropzone(".dropzone", {
		acceptedFiles: acceptedFileTypes,
		autoProcessQueue: false,
		parallelUploads: 10,
		addRemoveLinks: true,
		chunking: true,
		chunkSize: 3 * 1024 * 1024,
		forceChunking: true,
		retryChunks: true,
		retryChunksLimit: 10,
		maxFiles: 10,
		maxFilesize: uploadMaxSize,
		url: '_functions.php',
		init: function() {
			var myMulitDropzone = this;
			var errors = false;

			$('#uploadfiles').on("click", function() {
				myMulitDropzone.processQueue();
			});


			myMulitDropzone.on("processing", function() {
				$('#uploadfiles').attr('disabled', true).html('<span class="spinner-border spinner-border-sm me-2" role="status"></span> Processing...');
				$('input:checkbox[name="id[]"]').attr('disabled', true);
				errors = false;
			});

			myMulitDropzone.on("sending", function(file, xhr, data) {
				var mimetype = "unknown";
				var fname = file.name;
				var ftype = file.type;
				var playerID = getUrlParameterByName('playerID');
				if (ftype.includes("image")) mimetype = "image";
				else if (ftype.includes("video")) mimetype = "video";
				else mimetype = "unknown";

				var form = {};
				$.each($('#dropzoneupload').serializeArray(), function() {
					form[this.name] = this.value;
				});

				if (form.active == 'on') data.append("active", form.active);
				data.append("playerID", playerID);
				data.append("multidrop", '1');
				data.append("newAsset", '1');
				data.append("mimetype", mimetype);
				data.append("name", fname);
				data.append("duration", form.duration);
				data.append("end_date", form.end_date);
				data.append("end_time", form.end_time);
				data.append("start_date", form.start_date);
				data.append("start_time", form.start_time);
			});

			this.on("error", function(file) {
				errors = true;
			});

			this.on("success", function(file) {
				myMulitDropzone.removeFile(file);
				console.log(file.xhr.response);
			});

			this.on("queuecomplete", function() {
				console.log('queuecomplete');
				if (!errors) $('#uploadfiles').hide();
				if (!errors) location.reload();
			});
		}
	});
}

if ($('.dropzoneMulti').length) {
	var acceptedFileTypes = "image/*, video/*";
	var myMulitDropzone = new Dropzone(".dropzone", {
		acceptedFiles: acceptedFileTypes,
		autoProcessQueue: false,
		parallelUploads: 10,
		addRemoveLinks: true,
		chunking: true,
		chunkSize: 3 * 1024 * 1024,
		forceChunking: true,
		retryChunks: true,
		retryChunksLimit: 10,
		maxFiles: 10,
		maxFilesize: uploadMaxSize,
		url: '_functions.php',
		accept: function(file, done) {
			console.log("loaded");
			$('#refresh').hide();
			$('#uploadfiles').show();
			done();
		},
		init: function() {
			var myMulitDropzone = this;

			$('#uploadfiles').on("click", function() {
				myMulitDropzone.processQueue();
			});


			myMulitDropzone.on("processing", function() {
				$('#uploadfiles').attr('disabled', true).html('<span class="spinner-border spinner-border-sm me-2" role="status"></span> Processing...');
				$('input:checkbox[name="id[]"]').attr('disabled', true);
				errors = false;
			});

			myMulitDropzone.on("sending", function(file, xhr, data) {
				var ids = [];
				var mimetype = "unknown";
				var fname = file.name;
				var ftype = file.type;
				if (ftype.includes("image")) mimetype = "image";
				else if (ftype.includes("video")) mimetype = "video";
				else mimetype = "unknown";

				$("input:checkbox[name='id[]']:checked").each(function() {
					ids.push($(this).val());
				});
				var form = {};
				$.each($('#dropzoneupload').serializeArray(), function() {
					form[this.name] = this.value;
				});

				if (form.active == 'on') data.append("active", form.active);
				data.append("playerID", ids);
				data.append("multidrop", '1');
				data.append("newAsset", '1');
				data.append("mimetype", mimetype);
				data.append("name", fname);
				data.append("duration", form.duration);
				data.append("end_date", form.end_date);
				data.append("end_time", form.end_time);
				data.append("start_date", form.start_date);
				data.append("start_time", form.start_time);
			});

			this.on("success", function(file) {
				myMulitDropzone.removeFile(file);
				console.log(file.xhr.response);
			});

			this.on("error", function (file) {
				errors = true;
			});

			this.on("queuecomplete", function() {
				console.log('queuecomplete');
				if (!errors) $('#uploadfiles').hide();
				if (!errors) $('#refresh').show();
				if (!errors) $('.dz-message').text("Upload done! - Reload this page...");
			});
		}
	});
}

$('a[data-toggle="tab"]').on('show.bs.tab', function() {
	$('.card-body').find('input[type=checkbox]:checked').remove();
});

$("#assetNewForm").submit(function(e) {
	e.preventDefault();
	var form = $(this);
	var loopLength = 1;
	var reload = true;
	var formData = form.serialize();

	$("#saveAssetBtn").prop("disabled", true);
	$("#saveAssetBtn").html(
		`<span class="spinner-border spinner-border-sm me-2" role="status"></span> Processing...`
	);

	if (formData.indexOf("multiloader") >= 0) {
		loopLength = form[0].length;
	}

	for (var i = 0; i < loopLength; i++) {
		if (formData.indexOf("multiloader") >= 0) {
			reload = false;
			if (form[0][i].checked === true) {
				var newID = form[0][i].value;
				formData = $('input:not([name^=id])', this).serialize() + '&id=' + newID;
			} else continue;
		}

		$.ajax({
			url: '_functions.php',
			type: 'POST',
			data: formData,
			success: function(data) {
				$('#newAsset').modal('hide');
				setNotification('success', data);
				if (reload) location.reload();
			},
			error: function(data) {
				$.notify({
					icon: 'tim-icons icon-bell-55',
					message: data
				}, {
					type: 'danger',
					timer: 1000,
					placement: {
						from: 'bottom',
						align: 'center'
					}
				});
			}
		});
	}
});


$('button.options').on('click', function() {
	var eA = $('#editAsset');
	eA.find('#InputAssetName').val($(this).data('name'));
	eA.find('#InputAssetUrl').val($(this).data('uri'));
	eA.find('#InputAssetDuration').val($(this).data('duration'));
	eA.find('#InputAssetId').val($(this).data('asset'));
	flatpickr("#InputAssetStart", {
		altInput: true,
		altFormat: "d.m.Y",
		dateFormat: "Y-m-d",
		defaultDate: $(this).data('start-date')
	});
	flatpickr("#InputAssetStartTime", {
		enableTime: true,
		noCalendar: true,
		dateFormat: "H:i",
		time_24hr: true,
		defaultDate: $(this).data('start-time')
	});
	flatpickr("#InputAssetEnd", {
		altInput: true,
		altFormat: "d.m.Y",
		dateFormat: "Y-m-d",
		defaultDate: $(this).data('end-date')
	});
	flatpickr("#InputAssetEndTime", {
		enableTime: true,
		noCalendar: true,
		dateFormat: "H:i",
		time_24hr: true,
		defaultDate: $(this).data('end-time')
	});
	eA.modal('show');
	return false;
});

// New player
$('input:radio[name="add_player_mode"]').click(function() {
	var inputValue = $(this).attr("value");
	var targetBox = $("." + inputValue);
	$(".tab").not(targetBox).hide();
	$(targetBox).show();
});

$("#newPlayerDiscover").submit(function(e) {
	e.preventDefault();
	$(".start_discovery").html('Loading...');
	$('.start_discovery').prop('disabled', true);
	$("#InputCIDR").blur();
	$("#discoverStatus").empty();
	var form = $(this);
	$.ajax({
		url: 'assets/php/discover.php',
		type: 'GET',
		data: form.serialize(),
		success: function(data) {
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: 'Scan complete'
			}, {
				type: 'success',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
			$("#discoverStatus").html(data);
			$(".start_discovery").html('Discover');
			$('.start_discovery').prop('disabled', false);
		},
		error: function(data) {
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: 'Scan failed!'
			}, {
				type: 'danger',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
			$("#discoverStatus").html(data);
			$(".start_discovery").html('Discover');
			$('.start_discovery').prop('disabled', false);
		}
	});
});

$('.editPlayerOpen').on('click', function() {
	var id = $(this).data('playerid');
	var editInformation = 1;
	$.ajax({
		url: '_functions.php',
		type: 'POST',
		dataType: 'JSON',
		data: {
			playerID: id,
			editInformation: editInformation
		},
		success: function(response) {
			var eP = $('#editPlayer');
			eP.find('#playerIDEdit').val(id);
			eP.find('#InputPlayerNameEdit').val(response.player_name);
			eP.find('#playerNameTitle').text(response.player_name);
			eP.find('#InputLocationEdit').val(response.player_location);
			eP.find('#InputAdressEdit').val(response.player_address);
			eP.find('#InputUserEdit').val(response.player_user);
			eP.find('#InputPasswordEdit').val(response.player_password);
			eP.modal('show');
			return false;
		},
		error: function(data) {
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: 'Error! - Can \'t change the Player information'
			}, {
				type: 'danger',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
		}
	});
});

// Edit Group
$(document).on("click", ".editGroup", function () {
	var headline = $(".modal-content #editGroupModalLabel").text();
	$(".modal-content #group_name").val($(this).data("name"));
	$(".modal-content input[name=group_color][value=" + $(this).data("color") + "]").prop("checked", true);
	$(".modal-content #groupID").val($(this).data("id"));
	$(".modal-content #modalGroupSend").attr("name", "edit_group");
	var players = $(this).data("player");
	players = players.toString();
	if (players === "") {
		players = '0';
	}
	console.log(players);
	if (players.search(",")){
		players = players.split(',');
		for (let index = 0; index < players.length; index++) {
			$(".modal-content input[name*=group_player][value=" + players[index] + "]").prop("checked", true);
		}
	} else $(".modal-content input[name*=group_player][value=" + players + "]").prop("checked", true);
	$(".modal-content #modalGroupModalLabel").hide();
	$(".modal-content #modalGroupNewBtn").hide();
	$(".modal-content #editGroupModalLabel").text(headline.replace('{groupname}', $(this).data("name")));
	$(".modal-content #editGroupModalLabel").show();
	$(".modal-content #modalGroupEditBtn").show();
	$("#modalGroup").modal("show");
});

// Reset modalGroup Form
$('#modalGroup').on('hide.bs.modal', function (e) {
	$('#modalGroup form')[0].reset();
	$('input[name*=group_player]').prop('checked', false);
});

// Install Extensions
$("#installAddonForm").submit(function(e) {
	e.preventDefault();
	$(".install").html('In progress...');
	$('.install').prop('disabled', true);
	var form = $(this);
	$.ajax({
		url: 'index.php?site=addon',
		type: 'POST',
		data: form.serialize(),
		success: function(data) {
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: 'Installation started!'
			}, {
				type: 'success',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
			location.reload(2);
		},
		error: function(data) {
			$.notify({
				icon: 'tim-icons icon-bell-55',
				message: 'Error'
			}, {
				type: 'danger',
				timer: 1000,
				placement: {
					from: 'bottom',
					align: 'center'
				}
			});
			location.reload(2);
		}
	});
});

var addon_table = $('#addon').DataTable({
	dom: 'tipr',
	stateSave: false,
	autoWidth: false,
	order: [[2, 'desc']],
	initComplete: (settings, json) => {
		$('.dataTables_paginate').appendTo('#dataTables_paginate');
		$('.dataTables_info').appendTo('#dataTables_info');
	},
	language: {
		url: "assets/php/datatable_lang.json.php"
	}
});

$('#addonSearch').keyup(function() {
	addon_table.search($(this).val()).draw();
});

$('#addonLength_change').val(addon_table.page.len());

$('#addonLength_change').change(function() {
	addon_table.page.len($(this).val()).draw();
});

$('.installAddon').on('click', function() {
	var host = $(this).data('src');
	var header = $(this).data('header');
	var eP = $('#installAddon');
	eP.find('#InputAdressEdit').val(host);
	eP.find('#headerText').text(header);
	eP.find('#btnText').text(header);
	eP.modal('show');
});

$('.openlog').on('click', function() {
	var id = $(this).data('id');
	var header = $(this).data('header');
	var eP = $('#log-modal');
	eP.find('#headerText').text(header);
	eP.find('.logrefresh').data('id', id);
	loadLog(id);
	eP.modal('show');
});

$('.logrefresh').on('click', function() {
	var id = $(this).data('id');
	loadLog(id);
});

$('button.reboot').on('click', function() {
	var eR = $('#confirmReboot');
	var id = getUrlParameterByName('playerID');
	eR.modal('show');

	$('.exec_reboot').on('click', function() {
		var exec_reboot = 1;
		$.ajax({
			url: '_functions.php',
			type: 'POST',
			data: {
				playerID: id,
				exec_reboot: exec_reboot
			},
			success: function(data) {
				$.notify({
					icon: 'tim-icons icon-bell-55',
					message: data
				}, {
					type: 'success',
					timer: 1000,
					placement: {
						from: 'bottom',
						align: 'center'
					}
				});
				eR.modal('hide');
			},
			error: function(data) {
				$.notify({
					icon: 'tim-icons icon-bell-55',
					message: 'Error! - Can \'t change the Asset'
				}, {
					type: 'danger',
					timer: 1000,
					placement: {
						from: 'bottom',
						align: 'center'
					}
				});
				eR.modal('hide');
			}
		});
	});
});

$('#confirmMessage').on('show.bs.modal', function(e) {
	$(this).find('.btn-ok').attr('href', $(e.relatedTarget).data('href'));
	$(this).find('.delete-text').text($(e.relatedTarget).data('text'));
	$(this).find('.btn-ok').addClass('btn-' + $(e.relatedTarget).data('status'));
});

// Users

var users_table = $('#users').DataTable({
	dom: 'tipr',
	stateSave: false,
	autoWidth: false,
	order: [[3, 'asc'], [0, 'asc']],
	initComplete: (settings, json) => {
		$('.dataTables_paginate').appendTo('#dataTables_paginate');
		$('.dataTables_info').appendTo('#dataTables_info');
	},
	language: {
		url: "assets/php/datatable_lang.json.php"
	}
});

$('#usersSearch').keyup(function() {
	users_table.search($(this).val()).draw();
});

$('#usersLength_change').val(users_table.page.len());

$('#usersLength_change').change(function() {
	users_table.page.len($(this).val()).draw();
});

// $(function(){
//   var navMain = $('.navbar-collapse');
//   navMain.on('click', '[data-toggle="modal"]', null, function () {
//     navMain.collapse('hide');
//   });
// });

// Groups

var groups_table = $('#groups').DataTable({
	dom: 'tipr',
	stateSave: false,
	autoWidth: false,
	order: [[0, 'asc']],
	initComplete: (settings, json) => {
		$('.dataTables_paginate').appendTo('#dataTables_paginate');
		$('.dataTables_info').appendTo('#dataTables_info');
	},
	language: {
		url: "assets/php/datatable_lang.json.php"
	}
});

$('#groupsSearch').keyup(function() {
	groups_table.search($(this).val()).draw();
})

$('#groupsLength_change').val(groups_table.page.len());

$('#groupsLength_change').change(function() {
	groups_table.page.len($(this).val()).draw();
});

$('input[name="modules_enable"]').each(function() {
	if ($(this).is(':checked')) {
		$($(this).data('src')).show();
	}
});

$('input[name="players_enable"]').each(function() {
	if ($(this).is(':checked')) {
		$($(this).data('src')).show();
	}
});

$('input[name="set_user"]').each(function() {
	if ($(this).is(':checked')) {
		$($(this).data('src')).show();
	}
});

$(".quick_rights").click(function() {
	if ($(this).data('src') == 'reset') $('input[type="checkbox"]').prop('checked', false);
	if ($(this).data('src') == 'add') $("input[type='checkbox'][name*='add']").trigger('click');
	if ($(this).data('src') == 'edit') $("input[type='checkbox'][name*='edit']").trigger('click');
	if ($(this).data('src') == 'delete') $("input[type='checkbox'][name*='delete']").trigger('click');
	if ($(this).data('src') == 'special') {
		$("input[name='ass_clean']").trigger('click');
		$("input[name='ass_state']").trigger('click');
		$("input[name='pla_reboot']").trigger('click');
		$("input[name='set_user']").trigger('click');
		$("input[name='set_system']").trigger('click');
		$("input[name='set_public']").trigger('click');
	}
});


// Admin Log
var log_table = $('#log').DataTable({
	dom: 'tipr',
	stateSave: false,
	autoWidth: false,
	order: [[0, 'desc']],
	initComplete: (settings, json) => {
		$('.dataTables_paginate').appendTo('#dataTables_paginate');
		$('.dataTables_info').appendTo('#dataTables_info');
	},
	language: {
		url: "assets/php/datatable_lang.json.php"
	}
});

$('#logSearch').keyup(function() {
	log_table.search($(this).val()).draw();
});

$('#logLength_change').val(log_table.page.len());

$('#logLength_change').change(function() {
	log_table.page.len($(this).val()).draw();
});

// Profile settings
if ($('.avatar_upload').length) {
	var myAvatarDropzone = new Dropzone(".avatar_upload", {
		maxFilesize: 3,
		maxFile: 1,
		parallelUploads: 1,
		acceptedFiles: "image/*",
		resizeWidth: 256,
		resizeHeight: 256,
		resizeMethod: 'contain',
		success: function(file) {
			location.reload();
		},
	});
}

// Public Access Settings
$('#add_dark').on('click', function() {
	var text = $('#InputSetToken');
	text.val(text.val() + '&dark=1');
});

$('#open_token').on('click', function() {
	var text = $('#InputSetToken');
	window.open(text.val(), '_blank');
});

// Login
$("form#Login").submit(function(e) {
	var form = this;
	e.preventDefault();
	setTimeout(function() {
		form.submit();
	}, 1000);
	$('.login-progress').show();
});

// ---------------------------------------------------


$(document).ready(function() {
	reloadPlayerImage();
	if ($('.device-info').length) loadDeviceInfo();
});

setInterval('reloadPlayerImage()', settingsRefreshRate);
setInterval('loadDeviceInfo()', 1000);
