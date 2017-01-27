/**
 * KUtils gl utils
 */
KUtils = {
	uv: [0, 0],
	bbox: function(object) {
		var box = null;
		object.traverse(function(obj3D) {
			var geometry = obj3D.geometry;
			if (geometry === undefined) return;
			var elem = new THREE.Box3().setFromObject(obj3D);
			if (box === null) {
				box = elem;
			} else {
				box.union(elem);
			}
		});
		return box;
	},
	cleanGroup: function(scene, group) {
		group.traverse(function(child) {

			if (child instanceof THREE.Mesh) {
				//child.dispose();
				child.geometry.dispose();
				if (child.material.materials) child.material.materials.forEach(function(child_) {
					child_.dispose();
					if (child_.map) child_.map.dispose();
				})
				else {
					child.material.dispose();
					if (child.material.map) child.material.map.dispose();
				}
				scene.remove(child);
			}
		})
		group.children = [];
	},
	drawCanvas: function(text, options, canvas) {
		if (!options) options = {};
		var font = (options.font ? options.font : "12px Comic Sans MS, cursive, sans-serif");
		var c = canvas ? canvas : document.createElement("canvas");
		var ctx = c.getContext("2d");
		ctx.font = font;

		var textSize = parseInt(font);
		c.width = 32 //ctx.measureText(text).width;
			//c.width = 256;
		c.height = 16 //textSize;
			//reapply font
		ctx.font = font;

		ctx.textBaseline = 'middle';
		ctx.textAlign = "center";
		ctx.fillStyle = "rgba(0, 0, 0, 0)";
		ctx.clearRect(0, 0, c.width, c.height);

		ctx.fillStyle = options.color ? options.color : "rgba(0, 0, 0,1.0)";
		ctx.fillText(text, c.width / 2, c.height / 2);
		//test
		//document.body.appendChild(c);
		return c;
	},

	drawHPCanvas: function(text, options, canvas) {
		if (!options) options = {};
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
			//document.body.appendChild(this.canvas);
			//SIZE TEST
			var canvasTest = document.createElement("canvas");
			var gl = canvasTest.getContext("webgl") || canvasTest.getContext("experimental-webgl");
			var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
			console.log("Maximum texture size " + maxSize);
			//
			this.canvas.width = this.canvas.height = maxSize / 2;
			var ctx = this.canvas.getContext("2d");
			ctx.textBaseline = 'middle';
			ctx.textAlign = "center";
			ctx.fillStyle = "rgba(0, 0, 0, 0)";
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
		var font = (options.font ? options.font : "24px Comic Sans MS, cursive, sans-serif");
		var c = this.canvas;
		var ctx = c.getContext("2d");
		ctx.font = font;

		var textSize = parseInt(font) + 4;
		var textLength = ctx.measureText(text).width + 4;
		//reapply font
		ctx.font = font;
		ctx.fillStyle = options.color ? options.color : "rgba(0, 0, 0,1.0)";
		//ctx.fillStyle ="rgba(255, 0, 255,1.0)";

		var currentUV = this.uv.slice();

		if (this.uv[0] < c.width - textLength) {
			//currentUV = this.uv[0];
		} else {
			currentUV[0] = 0;
			currentUV[1] += textSize;
		}
		ctx.fillText(text, currentUV[0] + textLength / 2, currentUV[1] + textSize / 2);
		this.uv[0] = currentUV[0] + textLength;
		this.uv[1] = currentUV[1]; // + textSize;

		return [currentUV[0] / this.canvas.width, 1 - currentUV[1] / this.canvas.height, textLength / this.canvas.width, textSize / this.canvas.height];
	},
	drawHPCanvasTest: function(text, options, canvas) {
		if (!options) options = {};
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
			//document.body.appendChild(this.canvas);
			//SIZE TEST
			var canvasTest = document.createElement("canvas");
			var gl = canvasTest.getContext("webgl") || canvasTest.getContext("experimental-webgl");
			var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
			console.log("Maximum texture size " + maxSize);
			//
			this.canvas.width = this.canvas.height = maxSize / 2;
			var ctx = this.canvas.getContext("2d");
			ctx.textBaseline = 'middle';
			ctx.textAlign = "center";
			ctx.fillStyle = "rgba(0, 0, 0, 0)";
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			var font = "24px Comic Sans MS, cursive, sans-serif";
			ctx.font = font;
			this.ctx = ctx;
		}

		var textSize = 28;
		var textLength = this.ctx.measureText(text).width + 4;
		//reapply font
		this.ctx.font = font;
		this.ctx.fillStyle = "rgba(255, 255, 255,1.0)";
		var currentUV = this.uv.slice();

		if (this.uv[0] < this.canvas.width - textLength) {
			//currentUV = this.uv[0];
		} else {
			currentUV[0] = 0;
			currentUV[1] += textSize;
		}
		this.ctx.fillText(text, currentUV[0] + textLength / 2, currentUV[1] + textSize / 2);
		this.uv[0] = currentUV[0] + textLength;
		this.uv[1] = currentUV[1]; // + textSize;

		return [currentUV[0] / this.canvas.width, 1 - currentUV[1] / this.canvas.height, textLength / this.canvas.width, textSize / this.canvas.height];
	},


	/**
	var spritey = makeTextSprite( " World! ", 
		{ fontsize: 32, fontface: "Georgia", borderColor: {r:0, g:0, b:255, a:1.0} } );
	spritey.position.set(55,105,55);
	scene.add( spritey );
	*/
	makeTextSprite: function(message, parameters) {
		var canvas = KUtils.drawCanvas(message, parameters);
		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial({
			map: texture
				//side: THREE.DoubleSide
				//useScreenCoordinates: false,
				//alignment: spriteAlignment
		});
		var sprite = new THREE.Sprite(spriteMaterial);
		sprite.scale.set(canvas.width, canvas.height, 1);
		return sprite;
	},
	makeHPTextSprite: function(message, parameters) {
		var uv = KUtils.drawHPCanvasTest(message, parameters);
		if (!this.texture) {
			this.texture = new THREE.Texture(this.canvas);
		} else {
			this.texture.needsUpdate = true;
		}
		return {
			texture: this.texture,
			uv: uv
		};
	},
	makeHPTextSprite2: function(context, processWork) {
		if(processWork)processWork(context);
	},
	cubeUVProjectionGroup: function(object3d, realW, realH) {
		object3d.traverse(function(mesh) {
			if (mesh instanceof THREE.Mesh)
				KUtils.cubeUVProjection(mesh, realW, realH);
		});
	},
	cubeUVProjection: function(mesh, realW, realH) {
		if (mesh instanceof THREE.Mesh) {
			if (mesh.material) {
				var hasTexture = true;
				// if (mesh.material.materials) {
				// 	mesh.material.materials.forEach(function(mat) {
				// 		if (mat.map || mat.bumpMap || mat.envMap || mat.displacementMap || mat.normalMap) {
				// 			//FIXME only project if uv is empty
				// 			hasTexture = true;
				// 		}
				// 	})
				// } else {
				// 	if (mesh.material.map || mesh.material.bumpMap || mesh.material.envMap || mesh.material.displacementMap || mesh.material.normalMap) {

				// 		hasTexture = true;
				// 	}
				// }
				if (hasTexture) {
					KUtils.assignUVs(mesh.geometry, realW, realH); //30cmx30cm pattern

				}
			}
		}
	},
	generateExtrude: function(data, settings, mat, holes) {
		var shape = new THREE.Shape();

		data.forEach(function(child, index) {
			if (!index)
				shape.moveTo(data[index][0], data[index][1]);
			else
				shape.lineTo(data[index][0], data[index][1]);
		});
		if (holes)
			holes.forEach(function(hole) {
				var hole1 = new THREE.Path(hole);
				shape.holes.push(hole1);
			});
		var mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, settings), mat);
		return mesh;
	},
	getGroup: function(child) {
		var result = child.parent;
		while (!(result instanceof THREE.Group) || !$.isNumeric(result.name)) { // RB fix to get id of the parent of a window
			result = result.parent;
		}
		return result;
	},
	setGroupColor: function(group, color) {
		if (color === null || color === undefined) {
			group.traverse(function(child) {
				if (child.material)
					if (child.material.color) {
						child.material.color.copy(child.material._color);
					} else if (child.material.materials) {
					child.material.materials.forEach(function(mat) {
						mat.color.copy(mat._color);
					});
				}
			});
		} else
			group.traverse(function(child) {
				if (child.material)
					if (child.material.color) {
						if (!child.material._color) {
							child.material._color = new THREE.Color();
							child.material._color.copy(child.material.color);
						}
						child.material.color.setHex(color);
					} else if (child.material.materials) {
					child.material.materials.forEach(function(mat) {
						if (!mat._color) {
							mat._color = new THREE.Color();
							mat._color.copy(mat.color);
						}
						mat.color.setHex(color);
					});
				}
			});
	}

}
if (typeof module != 'undefined')
	module.exports = KUtils;