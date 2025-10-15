let currentDate = new Date();
let habitData = {};
let photoData = {};
let habitNames = {
	habit1: "Ejercicio diario",
	habit2: "Leer 30 minutos",
	habit3: "Meditar"
};

function loadData() {
	const savedHabitData = localStorage.getItem("habitTrackerData");
	const savedPhotoData = localStorage.getItem("habitTrackerPhotos");
	const savedHabitNames = localStorage.getItem("habitTrackerNames");

	if (savedHabitData) {
		habitData = JSON.parse(savedHabitData);
	}

	if (savedPhotoData) {
		photoData = JSON.parse(savedPhotoData);
	}

	if (savedHabitNames) {
		habitNames = JSON.parse(savedHabitNames);
		document.getElementById("habit1").value = habitNames.habit1;
		document.getElementById("habit2").value = habitNames.habit2;
		document.getElementById("habit3").value = habitNames.habit3;
	}
}

function saveData() {
	localStorage.setItem("habitTrackerData", JSON.stringify(habitData));
	localStorage.setItem("habitTrackerPhotos", JSON.stringify(photoData));
	localStorage.setItem("habitTrackerNames", JSON.stringify(habitNames));
}

function updateMonthDisplay() {
	const months = [
		"Enero",
		"Febrero",
		"Marzo",
		"Abril",
		"Mayo",
		"Junio",
		"Julio",
		"Agosto",
		"Septiembre",
		"Octubre",
		"Noviembre",
		"Diciembre"
	];
	document.getElementById("currentMonth").textContent = `${
		months[currentDate.getMonth()]
	} ${currentDate.getFullYear()}`;
}

function changeMonth(direction) {
	currentDate.setMonth(currentDate.getMonth() + direction);
	updateMonthDisplay();
	generateCalendar();
	updateStats();
}

function generateCalendar() {
	const calendar = document.getElementById("calendar");
	calendar.innerHTML = "";

	// Headers
	const headers = [
		"Día",
		habitNames.habit1,
		habitNames.habit2,
		habitNames.habit3,
		"Evidencias"
	];
	headers.forEach((header) => {
		const headerDiv = document.createElement("div");
		headerDiv.className = "calendar-header";
		headerDiv.textContent = header;
		calendar.appendChild(headerDiv);
	});

	// Días del mes
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	// Nombres de los días de la semana
	const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

	for (let day = 1; day <= daysInMonth; day++) {
		const dateKey = `${year}-${month + 1}-${day}`;

		// Obtener el día de la semana
		const fecha = new Date(year, month, day);
		const diaSemana = diasSemana[fecha.getDay()];

		// Columna del día
		const dayDiv = document.createElement("div");
		dayDiv.className = "calendar-day";
		dayDiv.innerHTML = `
			<div class="day-number">${day}</div>
			<div class="day-name">${diaSemana}</div>
		`;

		// Añadir indicador de completado para el día
		const completedCount = getCompletedHabitsCount(dateKey);
		if (completedCount > 0) {
			const completionDiv = document.createElement("div");
			completionDiv.className = "day-completion";
			completionDiv.textContent = `${completedCount}/3`;
			dayDiv.appendChild(completionDiv);
		}

		calendar.appendChild(dayDiv);

		// Columnas de hábitos
		for (let habit = 1; habit <= 3; habit++) {
			const habitDiv = document.createElement("div");
			habitDiv.className = "calendar-day";

			const habitCheck = document.createElement("div");
			habitCheck.className = "habit-check";

			const checkbox = document.createElement("div");
			checkbox.className = "habit-checkbox";
			if (habitData[dateKey] && habitData[dateKey][`habit${habit}`]) {
				checkbox.classList.add("checked");
			}
			checkbox.onclick = () => toggleHabit(dateKey, habit, checkbox);

			const habitLabel = document.createElement("span");
			habitLabel.textContent = habitNames[`habit${habit}`];

			habitCheck.appendChild(checkbox);
			habitCheck.appendChild(habitLabel);
			habitDiv.appendChild(habitCheck);
			calendar.appendChild(habitDiv);
		}

		// Columna de evidencias
		const photoDiv = document.createElement("div");
		photoDiv.className = "calendar-day";

		const photoSection = document.createElement("div");
		photoSection.className = "photo-section";

		// Mostrar contador de fotos si existen
		const photoCount = photoData[dateKey] ? photoData[dateKey].length : 0;

		if (photoCount > 0) {
			// Mostrar miniatura de la primera foto
			const photoContainer = document.createElement("div");
			photoContainer.className = "photo-container";

			const img = document.createElement("img");
			img.className = "photo-preview";
			img.src =
				typeof photoData[dateKey][0] === "string"
					? photoData[dateKey][0]
					: photoData[dateKey][0].src;
			img.onclick = () => showPhotoActions(dateKey);
			img.title = "Click para gestionar evidencias";

			photoContainer.appendChild(img);

			// Mostrar badge con cantidad si hay más de una foto
			if (photoCount > 1) {
				const badge = document.createElement("span");
				badge.className = "photo-count-badge";
				badge.textContent = photoCount;
				photoContainer.appendChild(badge);
			}

			photoSection.appendChild(photoContainer);
		} else {
			// Botón para agregar primera foto
			const addBtn = document.createElement("div");
			addBtn.className = "photo-btn";
			addBtn.innerHTML = "📷";
			addBtn.title = "Agregar evidencia";
			addBtn.onclick = () => showPhotoActions(dateKey);

			photoSection.appendChild(addBtn);
		}

		photoDiv.appendChild(photoSection);
		calendar.appendChild(photoDiv);
	}
}

function getCompletedHabitsCount(dateKey) {
	if (!habitData[dateKey]) return 0;

	let count = 0;
	for (let i = 1; i <= 3; i++) {
		if (habitData[dateKey][`habit${i}`]) {
			count++;
		}
	}
	return count;
}

function toggleHabit(dateKey, habitNumber, checkbox) {
	if (!habitData[dateKey]) {
		habitData[dateKey] = {};
	}

	const habitKey = `habit${habitNumber}`;
	habitData[dateKey][habitKey] = !habitData[dateKey][habitKey];

	if (habitData[dateKey][habitKey]) {
		checkbox.classList.add("checked");
	} else {
		checkbox.classList.remove("checked");
	}

	saveData();
	updateStats();
	generateCalendar();
}

function handlePhotoUpload(event, dateKey, replaceAll = false) {
	const files = event.target.files;
	if (files.length > 0) {
		if (replaceAll) {
			photoData[dateKey] = [];
		} else {
			if (!photoData[dateKey]) {
				photoData[dateKey] = [];
			}
		}

		Array.from(files).forEach((file) => {
			if (!file.type.startsWith("image/")) {
				alert("Por favor, selecciona solo archivos de imagen");
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				alert("La imagen es demasiado grande. Máximo 5MB permitido.");
				return;
			}

			const reader = new FileReader();
			reader.onload = function (e) {
				photoData[dateKey].push({
					src: e.target.result,
					timestamp: new Date().toISOString(),
					name: file.name
				});
				saveData();
				generateCalendar();

				const action = replaceAll ? "reemplazada" : "agregada";
				showNotification(
					`Evidencia ${action} correctamente`,
					"success"
				);
			};

			reader.onerror = function () {
				showNotification("Error al cargar la imagen", "error");
			};

			reader.readAsDataURL(file);
		});

		event.target.value = "";
	}
}

function showPhotoActions(dateKey) {
	const modal = document.getElementById("photoActionsModal");
	const buttonsContainer = document.getElementById("photoActionsButtons");
	buttonsContainer.innerHTML = "";

	const hasPhotos = photoData[dateKey] && photoData[dateKey].length > 0;

	if (hasPhotos) {
		const viewBtn = document.createElement("button");
		viewBtn.className = "photo-action-btn primary";
		viewBtn.innerHTML = "👁️ Ver Evidencias";
		viewBtn.onclick = () => {
			closePhotoActions();
			showPhotoGallery(dateKey);
		};
		buttonsContainer.appendChild(viewBtn);

		const addMoreBtn = document.createElement("button");
		addMoreBtn.className = "photo-action-btn primary";
		addMoreBtn.innerHTML = "➕ Agregar Más";
		addMoreBtn.onclick = () => {
			closePhotoActions();
			triggerFileUpload(dateKey, false);
		};
		buttonsContainer.appendChild(addMoreBtn);

		const replaceBtn = document.createElement("button");
		replaceBtn.className = "photo-action-btn secondary";
		replaceBtn.innerHTML = "🔄 Reemplazar Todas";
		replaceBtn.onclick = () => {
			if (
				confirm(
					"¿Estás seguro de que quieres reemplazar todas las evidencias?"
				)
			) {
				closePhotoActions();
				triggerFileUpload(dateKey, true);
			}
		};
		buttonsContainer.appendChild(replaceBtn);

		const deleteAllBtn = document.createElement("button");
		deleteAllBtn.className = "photo-action-btn danger";
		deleteAllBtn.innerHTML = "🗑️ Eliminar Todas";
		deleteAllBtn.onclick = () => {
			if (
				confirm(
					"¿Estás seguro de que quieres eliminar todas las evidencias?"
				)
			) {
				delete photoData[dateKey];
				saveData();
				generateCalendar();
				closePhotoActions();
				showNotification("Evidencias eliminadas", "info");
			}
		};
		buttonsContainer.appendChild(deleteAllBtn);
	} else {
		const addBtn = document.createElement("button");
		addBtn.className = "photo-action-btn primary";
		addBtn.innerHTML = "📷 Agregar Evidencia";
		addBtn.onclick = () => {
			closePhotoActions();
			triggerFileUpload(dateKey, false);
		};
		buttonsContainer.appendChild(addBtn);
	}

	const cancelBtn = document.createElement("button");
	cancelBtn.className = "photo-action-btn secondary";
	cancelBtn.innerHTML = "✕ Cancelar";
	cancelBtn.onclick = closePhotoActions;
	buttonsContainer.appendChild(cancelBtn);

	modal.style.display = "flex";
}

function closePhotoActions() {
	document.getElementById("photoActionsModal").style.display = "none";
}

function triggerFileUpload(dateKey, replaceAll) {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = "image/*";
	fileInput.multiple = true;
	fileInput.onchange = (e) => handlePhotoUpload(e, dateKey, replaceAll);
	fileInput.click();
}

function showPhotoGallery(dateKey) {
	const modal = document.getElementById("photoActionsModal");
	const buttonsContainer = document.getElementById("photoActionsButtons");
	buttonsContainer.innerHTML = "";

	const title = document.querySelector(".photo-actions-title");
	title.textContent = "Galería de Evidencias";

	const galleryContainer = document.createElement("div");
	galleryContainer.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 10px;
                margin-bottom: 20px;
                max-height: 400px;
                overflow-y: auto;
            `;

	photoData[dateKey].forEach((photo, index) => {
		const photoItem = document.createElement("div");
		photoItem.style.cssText = `
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                `;

		const img = document.createElement("img");
		img.src = typeof photo === "string" ? photo : photo.src;
		img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                `;
		img.onclick = () => {
			closePhotoActions();
			openModal(typeof photo === "string" ? photo : photo.src);
		};

		const deleteBtn = document.createElement("button");
		deleteBtn.innerHTML = "×";
		deleteBtn.style.cssText = `
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: #ef4444;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
		deleteBtn.onclick = (e) => {
			e.stopPropagation();
			if (confirm("¿Eliminar esta evidencia?")) {
				photoData[dateKey].splice(index, 1);
				if (photoData[dateKey].length === 0) {
					delete photoData[dateKey];
				}
				saveData();
				generateCalendar();
				closePhotoActions();
				showNotification("Evidencia eliminada", "info");
			}
		};

		photoItem.appendChild(img);
		photoItem.appendChild(deleteBtn);
		galleryContainer.appendChild(photoItem);
	});

	buttonsContainer.appendChild(galleryContainer);

	const backBtn = document.createElement("button");
	backBtn.className = "photo-action-btn secondary";
	backBtn.innerHTML = "← Volver";
	backBtn.onclick = () => {
		title.textContent = "Gestionar Evidencias";
		closePhotoActions();
		showPhotoActions(dateKey);
	};
	buttonsContainer.appendChild(backBtn);

	modal.style.display = "flex";
}

function showNotification(message, type = "info") {
	let notification = document.getElementById("notification");
	if (!notification) {
		notification = document.createElement("div");
		notification.id = "notification";
		notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transition: all 0.3s ease;
                    transform: translateX(100%);
                    opacity: 0;
                `;
		document.body.appendChild(notification);
	}

	const colors = {
		success: "#10b981",
		error: "#ef4444",
		info: "#3b82f6",
		warning: "#f59e0b"
	};

	notification.textContent = message;
	notification.style.backgroundColor = colors[type] || colors.info;

	setTimeout(() => {
		notification.style.transform = "translateX(0)";
		notification.style.opacity = "1";
	}, 100);

	setTimeout(() => {
		notification.style.transform = "translateX(100%)";
		notification.style.opacity = "0";
	}, 3000);
}

function openModal(imageSrc) {
	document.getElementById("modalImage").src = imageSrc;
	document.getElementById("photoModal").style.display = "flex";
	document.body.style.overflow = "hidden";
}

function closeModal() {
	document.getElementById("photoModal").style.display = "none";
	document.body.style.overflow = "auto";
}

function exportData() {
	const data = {
		habitData,
		photoData,
		habitNames,
		exportDate: new Date().toISOString(),
		version: "1.0"
	};

	const dataStr = JSON.stringify(data, null, 2);
	const dataBlob = new Blob([dataStr], { type: "application/json" });

	const link = document.createElement("a");
	link.href = URL.createObjectURL(dataBlob);
	link.download = `habitos-${currentDate.getFullYear()}-${
		currentDate.getMonth() + 1
	}.json`;
	link.click();

	showNotification("Datos exportados correctamente", "success");
}

function importData(event) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function (e) {
		try {
			const importedData = JSON.parse(e.target.result);

			if (
				importedData.habitData &&
				importedData.photoData &&
				importedData.habitNames
			) {
				if (
					confirm(
						"¿Estás seguro de que quieres importar estos datos? Se sobrescribirán los datos actuales."
					)
				) {
					habitData = importedData.habitData;
					photoData = importedData.photoData;
					habitNames = importedData.habitNames;

					document.getElementById("habit1").value = habitNames.habit1;
					document.getElementById("habit2").value = habitNames.habit2;
					document.getElementById("habit3").value = habitNames.habit3;

					saveData();
					generateCalendar();
					updateStats();
					showNotification(
						"Datos importados correctamente",
						"success"
					);
				}
			} else {
				showNotification("Archivo inválido", "error");
			}
		} catch (error) {
			showNotification("Error al importar datos", "error");
			console.error("Error importing data:", error);
		}
	};

	reader.readAsText(file);
	event.target.value = "";
}

function clearMonthData() {
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth() + 1;

	if (
		confirm(
			`¿Estás seguro de que quieres limpiar todos los datos de ${getMonthName(
				month
			)} ${year}? Esta acción no se puede deshacer.`
		)
	) {
		const prefix = `${year}-${month}-`;

		Object.keys(habitData).forEach((key) => {
			if (key.startsWith(prefix)) {
				delete habitData[key];
			}
		});

		Object.keys(photoData).forEach((key) => {
			if (key.startsWith(prefix)) {
				delete photoData[key];
			}
		});

		saveData();
		generateCalendar();
		updateStats();
		showNotification("Datos del mes limpiados", "info");
	}
}

function getMonthName(month) {
	const months = [
		"Enero",
		"Febrero",
		"Marzo",
		"Abril",
		"Mayo",
		"Junio",
		"Julio",
		"Agosto",
		"Septiembre",
		"Octubre",
		"Noviembre",
		"Diciembre"
	];
	return months[month - 1];
}

function updateStats() {
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth() + 1;
	const daysInMonth = new Date(year, month, 0).getDate();

	let totalCompleted = 0;
	let totalPossible = daysInMonth * 3;
	let daysWithAtLeastOneHabit = 0;
	let perfectDays = 0;

	for (let day = 1; day <= daysInMonth; day++) {
		const dateKey = `${year}-${month}-${day}`;
		if (habitData[dateKey]) {
			let dayCompleted = false;
			let dayPerfect = true;

			for (let habit = 1; habit <= 3; habit++) {
				if (habitData[dateKey][`habit${habit}`]) {
					totalCompleted++;
					dayCompleted = true;
				} else {
					dayPerfect = false;
				}
			}

			if (dayCompleted) {
				daysWithAtLeastOneHabit++;
			}

			if (dayPerfect) {
				perfectDays++;
			}
		}
	}

	document.getElementById("totalDays").textContent = daysInMonth;
	document.getElementById("completedHabits").textContent = totalCompleted;
	document.getElementById("completedDays").textContent =
		daysWithAtLeastOneHabit;

	const successRate =
		totalPossible > 0
			? Math.round((totalCompleted / totalPossible) * 100)
			: 0;
	document.getElementById("successRate").textContent = `${successRate}%`;

	const perfectDaysElement = document.getElementById("perfectDays");
	if (perfectDaysElement) {
		perfectDaysElement.textContent = perfectDays;
	}
}

function addUtilityButtons() {
	const header = document.querySelector(".header");

	const utilsContainer = document.createElement("div");
	utilsContainer.style.cssText = `
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 15px;
                flex-wrap: wrap;
            `;

	const exportBtn = document.createElement("button");
	exportBtn.textContent = "📤 Exportar";
	exportBtn.onclick = exportData;

	const importBtn = document.createElement("button");
	importBtn.textContent = "📥 Importar";
	importBtn.onclick = () => document.getElementById("importInput").click();

	const clearBtn = document.createElement("button");
	clearBtn.textContent = "🗑️ Limpiar Mes";
	clearBtn.onclick = clearMonthData;

	const importInput = document.createElement("input");
	importInput.type = "file";
	importInput.id = "importInput";
	importInput.accept = ".json";
	importInput.style.display = "none";
	importInput.onchange = importData;

	[exportBtn, importBtn, clearBtn].forEach((btn) => {
		btn.style.cssText = `
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 8px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                `;
		btn.onmouseover = () =>
			(btn.style.background = "rgba(255,255,255,0.3)");
		btn.onmouseout = () => (btn.style.background = "rgba(255,255,255,0.2)");
	});

	utilsContainer.appendChild(exportBtn);
	utilsContainer.appendChild(importBtn);
	utilsContainer.appendChild(clearBtn);
	header.appendChild(utilsContainer);
	document.body.appendChild(importInput);
}

function addPerfectDaysStat() {
	const stats = document.querySelector(".stats");

	const perfectDaysCard = document.createElement("div");
	perfectDaysCard.className = "stat-card";
	perfectDaysCard.innerHTML = `
                <div class="stat-number" id="perfectDays">0</div>
                <div class="stat-label">Días perfectos (3/3)</div>
            `;

	stats.appendChild(perfectDaysCard);
}

document.addEventListener("keydown", function (e) {
	if (e.key === "Escape") {
		closeModal();
		closePhotoActions();
	}
});

document.getElementById("photoModal").addEventListener("click", function (e) {
	if (e.target === this) {
		closeModal();
	}
});

document
	.getElementById("photoActionsModal")
	.addEventListener("click", function (e) {
		if (e.target === this) {
			closePhotoActions();
		}
	});
function initCalendar() {
	loadData();
	updateMonthDisplay();
	addUtilityButtons();
	addPerfectDaysStat();
	generateCalendar();
	updateStats();

	document.getElementById("habit1").addEventListener("input", function () {
		habitNames.habit1 = this.value;
		saveData();
		generateCalendar();
	});
	document.getElementById("habit2").addEventListener("input", function () {
		habitNames.habit2 = this.value;
		saveData();
		generateCalendar();
	});
	document.getElementById("habit3").addEventListener("input", function () {
		habitNames.habit3 = this.value;
		saveData();
		generateCalendar();
	});
}

initCalendar();
