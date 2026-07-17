import { useState, useEffect } from "react";
import { Plus, Trash2, Settings, ChevronDown, ChevronUp, DollarSign, Package, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export default function ProductVariationsEditor({ variations = [], onChange }) {
  const [localVariations, setLocalVariations] = useState(variations);
  const [expandedVariations, setExpandedVariations] = useState({});

  useEffect(() => {
    if (variations && variations.length > 0) {
      setLocalVariations(variations);
    }
  }, [variations]);

  useEffect(() => {
    if (onChange) {
      onChange(localVariations);
    }
  }, [localVariations]);

  const toggleExpand = (index) => {
    setExpandedVariations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Add new variation
  const addVariation = () => {
    if (localVariations.length >= 5) {
      alert("Maximum 5 variations allowed");
      return;
    }

    const newVariation = {
      id: `var_${Date.now()}`,
      heading: "New Variation",
      required: false,
      values: [
        { name: "Option 1", value: "option-1", priceModifier: 0, stock: 100, skuModifier: "OPT1" }
      ]
    };

    setLocalVariations([...localVariations, newVariation]);
    setExpandedVariations(prev => ({ ...prev, [localVariations.length]: true }));
  };

  // Remove variation
  const removeVariation = (index) => {
    const updated = localVariations.filter((_, i) => i !== index);
    setLocalVariations(updated);
  };

  // Update variation heading
  const updateVariationHeading = (index, heading) => {
    const updated = [...localVariations];
    updated[index].heading = heading;
    setLocalVariations(updated);
  };

  // Update variation required status
  const updateVariationRequired = (index, required) => {
    const updated = [...localVariations];
    updated[index].required = required;
    setLocalVariations(updated);
  };

  // Add value to variation
  const addValue = (variationIndex) => {
    const updated = [...localVariations];
    const valueCount = updated[variationIndex].values.length + 1;
    updated[variationIndex].values.push({
      name: `Option ${valueCount}`,
      value: `option-${valueCount}`,
      priceModifier: 0,
      stock: 100,
      skuModifier: `OPT${valueCount}`
    });
    setLocalVariations(updated);
  };

  // Remove value from variation
  const removeValue = (variationIndex, valueIndex) => {
    const updated = [...localVariations];
    if (updated[variationIndex].values.length <= 1) {
      alert("At least one value is required");
      return;
    }
    updated[variationIndex].values = updated[variationIndex].values.filter((_, i) => i !== valueIndex);
    setLocalVariations(updated);
  };

  // Update value field
  const updateValue = (variationIndex, valueIndex, field, value) => {
    const updated = [...localVariations];
    updated[variationIndex].values[valueIndex][field] = value;
    setLocalVariations(updated);
  };

  // Quick add common variations
  const quickAddVariation = (type) => {
    if (localVariations.length >= 5) {
      alert("Maximum 5 variations allowed");
      return;
    }

    const timestamp = Date.now();
    const templates = {
      color: {
        id: `var_color_${timestamp}`,
        heading: "Color",
        required: true,
        values: [
          { name: "Black", value: "black", priceModifier: 0, stock: 100, skuModifier: "BLK" },
          { name: "White", value: "white", priceModifier: 0, stock: 100, skuModifier: "WHT" },
          { name: "Blue", value: "blue", priceModifier: 0, stock: 100, skuModifier: "BLU" }
        ]
      },
      size: {
        id: `var_size_${timestamp}`,
        heading: "Size",
        required: true,
        values: [
          { name: "Small", value: "small", priceModifier: 0, stock: 100, skuModifier: "S" },
          { name: "Medium", value: "medium", priceModifier: 0, stock: 100, skuModifier: "M" },
          { name: "Large", value: "large", priceModifier: 0, stock: 100, skuModifier: "L" },
          { name: "XL", value: "xl", priceModifier: 50, stock: 100, skuModifier: "XL" }
        ]
      },
      material: {
        id: `var_material_${timestamp}`,
        heading: "Material",
        required: false,
        values: [
          { name: "Cotton", value: "cotton", priceModifier: 0, stock: 100, skuModifier: "COT" },
          { name: "Polyester", value: "polyester", priceModifier: -20, stock: 100, skuModifier: "POL" },
          { name: "Silk", value: "silk", priceModifier: 100, stock: 50, skuModifier: "SLK" }
        ]
      },
      warranty: {
        id: `var_warranty_${timestamp}`,
        heading: "Warranty",
        required: false,
        values: [
          { name: "No Warranty", value: "none", priceModifier: 0, stock: 999, skuModifier: "NW" },
          { name: "1 Year", value: "1year", priceModifier: 200, stock: 999, skuModifier: "1Y" },
          { name: "2 Years", value: "2years", priceModifier: 350, stock: 999, skuModifier: "2Y" }
        ]
      },
      storage: {
        id: `var_storage_${timestamp}`,
        heading: "Storage",
        required: true,
        values: [
          { name: "64GB", value: "64gb", priceModifier: 0, stock: 100, skuModifier: "64" },
          { name: "128GB", value: "128gb", priceModifier: 2000, stock: 100, skuModifier: "128" },
          { name: "256GB", value: "256gb", priceModifier: 5000, stock: 50, skuModifier: "256" }
        ]
      }
    };

    if (templates[type]) {
      setLocalVariations([...localVariations, templates[type]]);
      setExpandedVariations(prev => ({ ...prev, [localVariations.length]: true }));
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF8FAB]" />
            Product Variations
          </h3>
          <p className="text-sm text-gray-500">Add up to 5 variations (Color, Size, Material, etc.)</p>
        </div>
        <div className="text-sm text-gray-400">
          {localVariations.length}/5 variations
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
        <span className="text-sm text-gray-500 mr-2">Quick Add:</span>
        {["color", "size", "material", "warranty", "storage"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => quickAddVariation(type)}
            disabled={localVariations.length >= 5}
            className="px-3 py-1 text-xs rounded-full border bg-gray-50 hover:bg-gray-100 capitalize disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + {type}
          </button>
        ))}
      </div>

      {/* Variations List */}
      <div className="space-y-4">
        {localVariations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No variations added yet</p>
            <p className="text-sm">Click Quick Add or Add Variation to start</p>
          </div>
        ) : (
          localVariations.map((variation, varIndex) => (
            <div key={variation.id || varIndex} className="border rounded-xl overflow-hidden">
              {/* Variation Header */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleExpand(varIndex)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF8FAB]/20 flex items-center justify-center text-[#FF8FAB] font-bold text-sm">
                    {varIndex + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">{variation.heading}</h4>
                    <p className="text-xs text-gray-500">
                      {variation.values.length} options • {variation.required ? "Required" : "Optional"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeVariation(varIndex); }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedVariations[varIndex] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Variation Content (Expandable) */}
              {expandedVariations[varIndex] && (
                <div className="p-4 space-y-4">
                  {/* Heading & Required */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Variation Name</Label>
                      <Input
                        value={variation.heading}
                        onChange={(e) => updateVariationHeading(varIndex, e.target.value)}
                        placeholder="e.g., Color, Size"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                      <Switch
                        checked={variation.required}
                        onCheckedChange={(checked) => updateVariationRequired(varIndex, checked)}
                      />
                      <Label className="text-sm">Required (customer must select)</Label>
                    </div>
                  </div>

                  {/* Values Table */}
                  <div className="mt-4">
                    <Label className="text-sm mb-2 block">Variation Options:</Label>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-3 py-2 text-left font-medium">Name</th>
                            <th className="px-3 py-2 text-left font-medium">
                              <DollarSign className="w-3 h-3 inline" /> Price +/-
                            </th>
                            <th className="px-3 py-2 text-left font-medium">Stock</th>
                            <th className="px-3 py-2 text-center font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variation.values.map((value, valIndex) => (
                            <tr key={valIndex} className="border-b hover:bg-gray-50">
                              <td className="px-2 py-2">
                                <Input
                                  value={value.name}
                                  onChange={(e) => {
                                    updateValue(varIndex, valIndex, "name", e.target.value);
                                    // Auto-generate value code from name
                                    updateValue(varIndex, valIndex, "value", e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                    // Auto-generate SKU modifier from name (first 3 chars uppercase)
                                    updateValue(varIndex, valIndex, "skuModifier", e.target.value.substring(0, 3).toUpperCase());
                                  }}
                                  placeholder="Display name"
                                  className="h-9 text-sm"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="number"
                                  value={value.priceModifier}
                                  onChange={(e) => updateValue(varIndex, valIndex, "priceModifier", parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="h-9 text-sm w-28"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="number"
                                  value={value.stock}
                                  onChange={(e) => updateValue(varIndex, valIndex, "stock", parseInt(e.target.value) || 0)}
                                  placeholder="100"
                                  className="h-9 text-sm w-24"
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeValue(varIndex, valIndex)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                  disabled={variation.values.length <= 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addValue(varIndex)}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Option
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Variation Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addVariation}
        disabled={localVariations.length >= 5}
        className="w-full mt-4"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Custom Variation ({localVariations.length}/5)
      </Button>

      {/* Summary */}
      {localVariations.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-[#FF8FAB]/10 to-[#4ECDC4]/10 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Summary:</strong> {localVariations.length} variation(s) with{" "}
            {localVariations.reduce((sum, v) => sum + v.values.length, 0)} total options
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {localVariations.map((v, i) => (
              <span key={i} className="px-2 py-1 bg-white rounded text-xs">
                {v.heading}: {v.values.length} options
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
