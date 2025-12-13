import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { Product } from "../../utils/storage";

interface AutocompleteInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectProduct: (product: Product) => void;
  onSearch: (query: string) => Promise<Product[]>;
  containerStyle?: ViewStyle;
}

export function AutocompleteInput({
  label,
  placeholder,
  value,
  onChangeText,
  onSelectProduct,
  onSearch,
  containerStyle,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (value.trim().length >= 2) {
        setIsSearching(true);
        const results = await onSearch(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [value, onSearch]);

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const renderSuggestionItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectProduct(item)}
    >
      <View style={styles.suggestionContent}>
        <View style={styles.suggestionHeader}>
          <Text style={styles.suggestionName}>{item.name}</Text>
          <View style={styles.usageCount}>
            <Ionicons name="time-outline" size={12} color={colors.gray[500]} />
            <Text style={styles.usageText}>×{item.useCount}</Text>
          </View>
        </View>
        <View style={styles.suggestionMacros}>
          <Text style={styles.suggestionCalories}>{item.calories} cal</Text>
          <Text style={styles.suggestionMacro}>P: {item.protein}g</Text>
          <Text style={styles.suggestionMacro}>C: {item.carbs}g</Text>
          <Text style={styles.suggestionMacro}>F: {item.fats}g</Text>
        </View>
      </View>
      <Ionicons
        name="add-circle-outline"
        size={20}
        color={colors.primary[600]}
      />
    </TouchableOpacity>
  );

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.gray[400]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.gray[400]}
          autoCapitalize="words"
        />
        {isSearching && (
          <Ionicons
            name="reload"
            size={20}
            color={colors.gray[400]}
            style={styles.loadingIcon}
          />
        )}
        {value.length > 0 && !isSearching && (
          <TouchableOpacity
            onPress={() => {
              onChangeText("");
              setShowSuggestions(false);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>Recent Products</Text>
            <Text style={styles.suggestionsCount}>{suggestions.length}</Text>
          </View>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  searchIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.gray[900],
  },
  loadingIcon: {
    marginRight: 12,
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    maxHeight: 300,
  },
  suggestionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[700],
  },
  suggestionsCount: {
    fontSize: 12,
    color: colors.gray[500],
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    flex: 1,
  },
  usageCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  usageText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  suggestionMacros: {
    flexDirection: "row",
    gap: 12,
  },
  suggestionCalories: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary[600],
  },
  suggestionMacro: {
    fontSize: 12,
    color: colors.gray[600],
  },
});
