package com.donation.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class VolunteerTask {

    private String name;
    private boolean completed = false;

    public VolunteerTask() {
    }

    public VolunteerTask(String name) {
        this.name = name;
        this.completed = false;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
