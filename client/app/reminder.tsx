import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from "@expo/vector-icons";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Reminder {
  id: string;
  subject: string;
  reminder: string;
}

const ReminderPage = () => {
  const [empId, setEmpId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10)); // Store as string initially
  const [reminder, setReminder] = useState('');
  const [subject, setSubject] = useState('Others');
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const fetchReminders = async (selectedDate: string) => {
    try {
      const localDate = new Date(selectedDate).toISOString().slice(0, 10); // Convert string to Date object
      const response = await axios.get(`https://global-hrm-mobile-server.vercel.app/employees/getAllReminders/${empId}`, {
        params: { date: localDate },
      });
      setReminders(response.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('empId').then((storedEmpId) => {
      setEmpId(storedEmpId);
      if (storedEmpId) {
        fetchReminders(date); // Fetch reminders when empId is available
      }
    });
  }, [date]);

  const handleAddReminder = async () => {
    if (reminder.trim()) {
      try {
        await axios.post(`https://global-hrm-mobile-server.vercel.app/employees/addReminders/${empId}`, {
          date,
          reminder,
          subject,
        });
        setReminder('');
        fetchReminders(date);
      } catch (error) {
        console.error("Error adding reminder:", error);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Calendar
        onDayPress={(day: any) => setDate(day.dateString)} // Use 'any' for day
        markedDates={{
          [date]: { selected: true, selectedColor: 'orange' },
        }}
        style={styles.calendar}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a reminder"
          value={reminder}
          onChangeText={setReminder}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.remindersContainer}>
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderContent}>
                {reminder.subject === 'Learning' ? (
                  <Ionicons name="notifications-outline" size={30} color="blue" />
                ) : (
                  <Ionicons name="calendar-outline" size={30} color="green" />
                )}
                <Text style={styles.reminderText}>{reminder.reminder}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noReminders}>No reminders available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeaea',
    padding: 10,
  },
  calendar: {
    marginBottom: 20,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  remindersContainer: {
    marginTop: 20,
  },
  reminderCard: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderText: {
    marginLeft: 10,
    fontSize: 16,
  },
  noReminders: {
    textAlign: 'center',
    color: '#888',
  },
});

export default ReminderPage;