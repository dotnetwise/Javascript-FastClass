/// <reference path="NamespacesAndEnumSupport.js" />

(function () {
	var reservedKeywords = {};
	['break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'finally',
	 'for', 'function', 'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try',
	 'typeof', 'var', 'void', 'while', 'with', 'class', 'enum', 'export', 'extends', 'import', 'super',
	 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield'
	].forEach(function (keyword) {
		reservedKeywords[keyword] = 1;
	});
	intellisense.addEventListener('statementcompletion', function (e) {
		e.items.forEach(function (item) {

			var value = item.value,
				parentObject = item.parentObject,
				kind = item.kind;
			if (typeof value === "number") {
				item.kind = "field";
				item.glyph = 'vs:GlyphGroupValueType';
			} else if (typeof value === "string") {
				item.kind = "field";
				item.glyph = 'vs:GlyphGroupType';
			} else if (typeof value === "boolean") {
				item.kind = "field";
				item.glyph = 'vs:GlyphGroupUnion';
			} else if (value instanceof RegExp) {
				item.kind = "field";
				item.glyph = 'vs:GlyphAssembly';
			} 
			else if (item.name === "constructor" || item.name[0].toUpperCase() == item.name[0] && item.name !== "Math") {
				item.glyph = 'vs:GlyphGroupClass';
				item.kind = "method";
			}
			else if (item.name === "prototype" || parentObject && item.value == parentObject.prototype && parentObject.prototype) {
				item.glyph = 'vs:GlyphGroupModule';
			}
			else if (parentObject && !parentObject.hasOwnProperty(item.name) && item.value === Object.prototype[item.name]) {

				item.kind = "field";
				//intellisense.logMessage("On Object prototype: " + item.name + ": " + parentObject.hasOwnProperty(item.name).toString() + typeof value);
				if (typeof value === "function") {
					item.glyph = "vs:GlyphReference";
					item.kind = "method";
				}
				else item.glyph = "vs:GlyphGroupTypedef";
			}
			else if (parentObject && !parentObject.hasOwnProperty(item.name)) {

				item.kind = "field";
				//intellisense.logMessage("On prototype: " + item.name + ": " + parentObject.hasOwnProperty(item.name).toString() + typeof value);
				if (typeof value === "function") {
					item.kind = "method";
					item.glyph = "vs:GlyphExtensionMethod";
				}
				else item.glyph = "vs:GlyphGroupTypedef";
			}
			else if (value && (value._isNamespace || value.__namespace)) {
				item.kind = "field";
				item.glyph = 'vs:GlyphGroupNamespace';
			}
			else if (value && (value._isClass || value.__class)) {
				item.kind = "method";
				item.glyph = 'vs:GlyphGroupClass';
			}
			else if (value && (value._isConst || value.__const)) {
				item.kind = "field";
				item.glyph = 'vs:GlyphGroupConst';
			}
			else if (value && (value._isDelegate || value.__delegate)) {
				item.kind = "method";
				item.glyph = 'vs:GlyphGroupDelegate';
			}
			else if (value && (value._isInterface || value.__interface)) {
				//item.value && item.value.__interface && intellisense.logMessage(item.name + " is interface " + item.kind + ", scope: " + item.scope);
				item.glyph = 'vs:GlyphGroupInterface';
			}
			else if ((value && (value._isEvent || value.__event || (value instanceof window.Event) === true))
				|| item.name.indexOf("on") === 0) {
				//TODO: better handling events
				item.kind = "method";
				item.glyph = 'vs:GlyphGroupEvent';
			}
			else if (value && (value._isEnum || value.__enum)) {
				item.kind = "field";
				item.glyph = 'vs:GlyphGroupEnum';
			}
			else if (value && (value._isMap || value.__map)) {
				item.kind = "field";
				item.glyph = 'vs:GlyphGroupMap';
			}
			else if (value && (value.prototype && value.prototype.nodeType || value.nodeType)) {
				item.kind = "field";
				item.glyph = 'vs:GlyphXmlItem';
			}
			else if (value === window.document || item.name === "document") {
				item.kind = "field";
				item.glyph = 'vs:GlyphLibrary';
			}
			else if (value === window) {
				item.kind = "field";
				item.glyph = 'vs:GlyphXmlNamespace';
			}
			else if (typeof value === "function") {
				item.kind = "method";
				item.glyph = 'vs:GlyphGroupMethod';
			} else if (value === null) {
				item.kind = "field";
				item.glyph = 'vs:GlyphJSharpDocument';
			} else if (typeof value === "undefined") {
				if (!reservedKeywords[item.name]) {
					if (!parentObject)
						if (item.name === "true" || item.name === "false")
							item.glyph = "vs:GlyphGroupUnion";
						else item.glyph = 'vs:GlyphMaybeReference';
					else item.glyph = 'vs:GlyphMaybeReference';
				}
			}
			else if (parentObject && (parentObject._isNamespace || parentObject.__namespace)) {
				//The item is a member of a namespace. 

				//All constructor functions that are part of a namespace 
				//are considered classes. 
				//A constructor function starts with
				//an uppercase letter by convention.  
				if (typeof value == 'function' && (item.name[0].toUpperCase()
					== item.name[0])) {
					item.glyph = 'vs:GlyphGroupClass';
				}
			}

		});
		e.items = e.items.filter(function (item) {
			var parentObject = item.parentObject;
			var hidden = parentObject
				? (parentObject.__enum || parentObject._isEnum)
					? item.kind != "field" 
					: false
				: false;
			if (parentObject && (parentObject.__namespace || parentObject._isNamespace)) {
				//intellisense.logMessage("Hiding: " + item.name);
				hidden = Object.prototype.hasOwnProperty(item.name) && !parentObject.hasOwnProperty(item.name);
			}
			return !hidden;
		});
	});

	intellisense.addEventListener('statementcompletionhint', function (e) {
		if (e.completionvalue) {
			//intellisense.logMessage("statementcompletionhint");
			if (e.completionvalue._isNamespace || e.completionvalue.__namespace) {
				e.symbolHelp.symbolDisplayType = 'Namespace';
			}
			if (e.completionvalue._isInterface || e.completionvalue.__interface) {
				item.value && item.value.__interface && intellisense.logMessage(item.name + " Interface");
				e.symbolHelp.symbolDisplayType = 'Interface';
			}
			if (e.completionvalue._isClass || e.completionvalue.__class) {
				e.symbolHelp.symbolDisplayType = 'Class';
			}
			if (e.completionvalue._isMap || e.completionvalue.__map) {
				e.symbolHelp.symbolDisplayType = 'Map';
			}
			if (e.completionvalue._isEnum || e.completionvalue.__enum) {
				e.symbolHelp.symbolDisplayType = 'Enum';
			}
		}
	});
})();

//  vs:GlyphArrow					Describes arrow symbols.
//  vs:GlyphAssembly					Describes symbols for assemblies.
//  vs:GlyphBscFile					Describes symbols for BSC files.
//  vs:GlyphCallersGraph				Describes symbols for callers graphs.
//  vs:GlyphCallGraph					Describes symbols for call graphs.
//  vs:GlyphClosedFolder				Describes symbols for closed folders.
//  vs:GlyphCoolProject				Describes symbols for C# projects.
//  vs:GlyphCppProject				Describes symbols for C++ projects.
//  vs:GlyphCSharpExpansion			Describes symbols for C# expansions.
//  vs:GlyphCSharpFile				Describes symbols for C# files.
//  vs:GlyphDialogId					Describes symbols for dialog identifiers.
//  vs:GlyphExtensionMethod			Describes symbols for extension methods.
//  vs:GlyphExtensionMethodFriend		Describes symbols for friend extension methods.
//  vs:GlyphExtensionMethodInternal		Describes symbols for internal extension methods.
//  vs:GlyphExtensionMethodPrivate		Describes symbols for private extension methods.
//  vs:GlyphExtensionMethodProtected		Describes symbols for protected extension methods.
//  vs:GlyphExtensionMethodShortcut		Describes symbols for extension method shortcuts.
//  vs:GlyphForwardType				Describes symbols for forwarded types.
//  vs:GlyphGroupClass				Describes symbols for classes.
//  vs:GlyphGroupConstant				Describes symbols for constants.
//  vs:GlyphGroupDelegate				Describes symbols for delegates.
//  vs:GlyphGroupEnum				Describes symbols for enumerations.
//  vs:GlyphGroupEnumMember			Describes symbols for enumeration members.
//  vs:GlyphGroupError				Describes symbols for errors.
//  vs:GlyphGroupEvent				Describes symbols for events.
//  vs:GlyphGroupException				Describes symbols for exceptions.
//  vs:GlyphGroupField				Describes symbols for fields.
//  vs:GlyphGroupInterface				Describes symbols for interfaces.
//  vs:GlyphGroupIntrinsic				Describes intrinsic symbols.
//  vs:GlyphGroupJSharpClass			Describes symbols for J# classes.
//  vs:GlyphGroupJSharpField			Describes symbols for J# fields.
//  vs:GlyphGroupJSharpInterface			Describes symbols for J# interfaces.
//  vs:GlyphGroupJSharpMethod			Describes symbols for J# methods.
//  vs:GlyphGroupJSharpNamespace		Describes symbols for J# namespaces.
//  vs:GlyphGroupMacro				Describes symbols for macros.
//  vs:GlyphGroupMap				Describes symbols for maps.
//  vs:GlyphGroupMapItem				Describes symbols for map items.
//  vs:GlyphGroupMethod				Describes symbols for methods.
//  vs:GlyphGroupModule				Describes symbols for modules.
//  vs:GlyphGroupNamespace			Describes symbols for namespaces.
//  vs:GlyphGroupOperator				Describes symbols for operators.
//  vs:GlyphGroupOverload				Describes symbols for overloads.
//  vs:GlyphGroupProperty				Describes symbols for properties.
//  vs:GlyphGroupStruct				Describes symbols for structures.
//  vs:GlyphGroupTemplate				Describes symbols for templates.
//  vs:GlyphGroupType				Describes symbols for types.
//  vs:GlyphGroupTypedef				Describes symbols for typedefs.
//  vs:GlyphGroupUnion				Describes symbols for unions.
//  vs:GlyphGroupUnknown				Describes symbols for unknown types.
//  vs:GlyphGroupValueType			Describes symbols for value types.
//  vs:GlyphGroupVariable				Describes symbols for variables.
//  vs:GlyphInformation				Describes symbols for information.
//  vs:GlyphJSharpDocument			Describes symbols for J# documents.
//  vs:GlyphJSharpProject				Describes symbols for J# projects.
//  vs:GlyphKeyword					Describes symbols for keywords.
//  vs:GlyphLibrary					Describes symbols for libraries.
//  vs:GlyphMaybeCall				Describes symbols for something that may be a call.
//  vs:GlyphMaybeCaller				Describes symbols for something that may be a caller.
//  vs:GlyphMaybeReference			Describes symbols for something that may be a reference.
//  vs:GlyphOpenFolder				Describes symbols for open folders.
//  vs:GlyphRecursion					Describes symbols for recursion.
//  vs:GlyphReference					Describes symbols for references.
//  vs:GlyphVBProject					Describes symbols for VB projects.
//  vs:GlyphWarning					Describes symbols for build warnings.
//  vs:GlyphXmlAttribute				Describes symbols for XML attributes.
//  vs:GlyphXmlAttributeCheck			Describes symbols with a check mark for XML attributes.
//  vs:GlyphXmlAttributeQuestion			Describes symbols with a question mark for XML attributes.
//  vs:GlyphXmlChild					Describes symbols for child XML elements.
//  vs:GlyphXmlChildCheck				Describes symbols with a check mark for XML child elements.
//  vs:GlyphXmlChildQuestion			Describes symbols with a question mark for XML child elements.
//  vs:GlyphXmlDescendant				Describes symbols for descendant XML elements.
//  vs:GlyphXmlDescendantCheck		Describes symbols with a check mark for XML descendant elements.
//  vs:GlyphXmlDescendantQuestion		Describes symbols with a question mark for XML descendant elements.
//  vs:GlyphXmlItem					Describes symbols for XML items.
//  vs:GlyphXmlNamespace				Describes symbols for XML namespaces.

